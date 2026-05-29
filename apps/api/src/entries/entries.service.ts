import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  FX_RATE_DECIMAL_PLACES,
  MONEY_DECIMAL_PLACES,
  type CreateEntryRequest,
  type EntryListQuery,
  type UpdateEntryRequest
} from '@qdd/shared';

import { AuditService } from '../audit/audit.service';
import { ApiError, notFound } from '../common/api-error';
import type { QddRequest } from '../common/request-context';
import { getActor, getRequestId } from '../common/request-context';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { decimalLikeToFixed, mapEntry } from './mappers';
import { calculateBaseAmount } from './money';

type AuditContext = {
  actorId: string | null;
  actorLabel: string;
  requestId: string;
};

type LedgerRecord = {
  id: string;
  baseCurrency: string;
};

type ExistingMoneyRecord = {
  originalAmount: {
    toFixed(decimalPlaces?: number): string;
    toString(): string;
  };
  originalCurrency: string;
  fxRate: {
    toFixed(decimalPlaces?: number): string;
    toString(): string;
  };
};

type ResolvedMoney = {
  originalAmount: string;
  originalCurrency: string;
  fxRate: string;
  baseAmount: string;
  baseCurrency: string;
};

type MoneyInput = {
  originalAmount?: string | undefined;
  originalCurrency?: string | undefined;
  fxRate?: string | undefined;
};

function auditContextFromRequest(request: QddRequest): AuditContext {
  return {
    ...getActor(request),
    requestId: getRequestId(request)
  };
}

function parseOccurredAt(value: string | undefined): Date {
  if (!value) {
    return new Date();
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError('ENTRY_OCCURRED_AT_INVALID', 'Entry datetime is invalid.');
  }

  return date;
}

function orderByForQuery(query: EntryListQuery): Prisma.EntryOrderByWithRelationInput[] {
  const direction = query.sortDirection;
  switch (query.sortBy) {
    case 'baseAmount':
      return [{ baseAmount: direction }, { occurredAt: 'desc' }, { createdAt: 'desc' }];
    case 'createdAt':
      return [{ createdAt: direction }, { occurredAt: 'desc' }];
    case 'updatedAt':
      return [{ updatedAt: direction }, { occurredAt: 'desc' }];
    case 'occurredAt':
      return [{ occurredAt: direction }, { createdAt: 'desc' }];
    default:
      return [{ occurredAt: 'desc' }, { createdAt: 'desc' }];
  }
}

@Injectable()
export class EntriesService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(AuditService)
    private readonly audit: AuditService
  ) {}

  async listEntries(ledgerId: string, query: EntryListQuery) {
    await this.requireLedger(ledgerId);

    const where: Prisma.EntryWhereInput = {
      ledgerId,
      deletedAt: null
    };

    if (query.type) {
      where.type = query.type;
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.memberId) {
      where.memberId = query.memberId;
    }
    if (query.merchantId) {
      where.merchantId = query.merchantId;
    }
    if (query.projectId) {
      where.projectId = query.projectId;
    }
    if (query.occurredFrom || query.occurredTo) {
      const occurredAt: Prisma.DateTimeFilter<'Entry'> = {};
      if (query.occurredFrom) {
        occurredAt.gte = new Date(query.occurredFrom);
      }
      if (query.occurredTo) {
        occurredAt.lte = new Date(query.occurredTo);
      }
      where.occurredAt = occurredAt;
    }

    const entries = await this.prisma.entry.findMany({
      where,
      orderBy: orderByForQuery(query)
    });

    return { entries: entries.map(mapEntry) };
  }

  async getEntry(ledgerId: string, entryId: string) {
    const entry = await this.requireEntry(ledgerId, entryId);
    return { entry: mapEntry(entry) };
  }

  async createEntry(ledgerId: string, input: CreateEntryRequest, request: QddRequest) {
    const ledger = await this.requireLedger(ledgerId);
    await this.requireCategory(ledgerId, input.categoryId);
    await this.requireMember(ledgerId, input.memberId);
    if (input.merchantId) {
      await this.requireMerchant(ledgerId, input.merchantId);
    }
    if (input.projectId) {
      await this.requireProject(ledgerId, input.projectId);
    }

    const money = this.resolveMoney(ledger, input);
    const entry = await this.prisma.entry.create({
      data: {
        ledgerId,
        type: input.type,
        occurredAt: parseOccurredAt(input.occurredAt),
        originalAmount: money.originalAmount,
        originalCurrency: money.originalCurrency,
        fxRate: money.fxRate,
        baseAmount: money.baseAmount,
        baseCurrency: money.baseCurrency,
        categoryId: input.categoryId,
        memberId: input.memberId,
        merchantId: input.merchantId ?? null,
        projectId: input.projectId ?? null,
        note: input.note
      }
    });

    await this.audit.record({
      ...auditContextFromRequest(request),
      action: 'entry.create',
      entityType: 'entry',
      entityId: entry.id,
      ledgerId,
      metadata: { type: entry.type, baseAmount: money.baseAmount, baseCurrency: money.baseCurrency }
    });

    return { entry: mapEntry(entry) };
  }

  async updateEntry(ledgerId: string, entryId: string, input: UpdateEntryRequest, request: QddRequest) {
    const ledger = await this.requireLedger(ledgerId);
    const existing = await this.requireEntry(ledgerId, entryId);

    if (input.categoryId !== undefined) {
      await this.requireCategory(ledgerId, input.categoryId);
    }
    if (input.memberId !== undefined) {
      await this.requireMember(ledgerId, input.memberId);
    }
    if (input.merchantId) {
      await this.requireMerchant(ledgerId, input.merchantId);
    }
    if (input.projectId) {
      await this.requireProject(ledgerId, input.projectId);
    }

    const money = this.resolveMoney(ledger, input, existing);
    const data: Prisma.EntryUncheckedUpdateInput = {
      originalAmount: money.originalAmount,
      originalCurrency: money.originalCurrency,
      fxRate: money.fxRate,
      baseAmount: money.baseAmount,
      baseCurrency: money.baseCurrency,
      version: { increment: 1 }
    };

    if (input.type !== undefined) {
      data.type = input.type;
    }
    if (input.occurredAt !== undefined) {
      data.occurredAt = parseOccurredAt(input.occurredAt);
    }
    if (input.categoryId !== undefined) {
      data.categoryId = input.categoryId;
    }
    if (input.memberId !== undefined) {
      data.memberId = input.memberId;
    }
    if ('merchantId' in input) {
      data.merchantId = input.merchantId ?? null;
    }
    if ('projectId' in input) {
      data.projectId = input.projectId ?? null;
    }
    if (input.note !== undefined) {
      data.note = input.note;
    }

    const entry = await this.prisma.entry.update({
      where: { id: entryId },
      data
    });

    await this.audit.record({
      ...auditContextFromRequest(request),
      action: 'entry.update',
      entityType: 'entry',
      entityId: entry.id,
      ledgerId,
      metadata: { fields: Object.keys(input), baseAmount: money.baseAmount, baseCurrency: money.baseCurrency }
    });

    return { entry: mapEntry(entry) };
  }

  async cloneEntry(ledgerId: string, entryId: string, request: QddRequest) {
    await this.requireLedger(ledgerId);
    const existing = await this.requireEntry(ledgerId, entryId);

    const entry = await this.prisma.entry.create({
      data: {
        ledgerId,
        type: existing.type,
        occurredAt: existing.occurredAt,
        originalAmount: decimalLikeToFixed(existing.originalAmount, MONEY_DECIMAL_PLACES),
        originalCurrency: existing.originalCurrency,
        fxRate: decimalLikeToFixed(existing.fxRate, FX_RATE_DECIMAL_PLACES),
        baseAmount: decimalLikeToFixed(existing.baseAmount, MONEY_DECIMAL_PLACES),
        baseCurrency: existing.baseCurrency,
        categoryId: existing.categoryId,
        memberId: existing.memberId,
        merchantId: existing.merchantId,
        projectId: existing.projectId,
        note: existing.note
      }
    });

    await this.audit.record({
      ...auditContextFromRequest(request),
      action: 'entry.clone',
      entityType: 'entry',
      entityId: entry.id,
      ledgerId,
      metadata: { sourceEntryId: entryId }
    });

    return { entry: mapEntry(entry) };
  }

  async deleteEntry(ledgerId: string, entryId: string, request: QddRequest): Promise<void> {
    await this.requireLedger(ledgerId);
    await this.requireEntry(ledgerId, entryId);

    await this.prisma.entry.update({
      where: { id: entryId },
      data: {
        deletedAt: new Date(),
        version: { increment: 1 }
      }
    });

    await this.audit.record({
      ...auditContextFromRequest(request),
      action: 'entry.delete',
      entityType: 'entry',
      entityId: entryId,
      ledgerId,
      metadata: {}
    });
  }

  private resolveMoney(
    ledger: LedgerRecord,
    input: MoneyInput,
    existing?: ExistingMoneyRecord
  ): ResolvedMoney {
    const originalAmount =
      input.originalAmount ?? decimalLikeToFixed(existing?.originalAmount ?? missingExistingMoney(), MONEY_DECIMAL_PLACES);
    const originalCurrency = input.originalCurrency ?? existing?.originalCurrency ?? ledger.baseCurrency;
    const previousCurrency = existing?.originalCurrency ?? ledger.baseCurrency;

    let fxRate: string;
    if (originalCurrency === ledger.baseCurrency) {
      fxRate = '1.00000000';
    } else if (input.fxRate !== undefined) {
      fxRate = input.fxRate;
    } else if (existing && previousCurrency === originalCurrency) {
      fxRate = decimalLikeToFixed(existing.fxRate, FX_RATE_DECIMAL_PLACES);
    } else {
      throw new ApiError(
        'ENTRY_FX_RATE_REQUIRED',
        'FX rate is required when original currency differs from the ledger base currency.',
        HttpStatus.BAD_REQUEST
      );
    }

    return {
      originalAmount,
      originalCurrency,
      fxRate,
      baseAmount: calculateBaseAmount(originalAmount, fxRate),
      baseCurrency: ledger.baseCurrency
    };
  }

  private async requireLedger(ledgerId: string): Promise<LedgerRecord> {
    const ledger = await this.prisma.ledger.findFirst({
      where: { id: ledgerId, deletedAt: null },
      select: { id: true, baseCurrency: true }
    });
    if (!ledger) {
      throw notFound('LEDGER_NOT_FOUND', 'Ledger not found.');
    }

    return ledger;
  }

  private async requireEntry(ledgerId: string, entryId: string) {
    const entry = await this.prisma.entry.findFirst({
      where: { id: entryId, ledgerId, deletedAt: null }
    });
    if (!entry) {
      throw notFound('ENTRY_NOT_FOUND', 'Entry not found.');
    }

    return entry;
  }

  private async requireCategory(ledgerId: string, categoryId: string): Promise<void> {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, ledgerId, deletedAt: null, status: 'active' },
      select: { id: true }
    });
    if (!category) {
      throw notFound('CATEGORY_NOT_FOUND', 'Category not found.');
    }
  }

  private async requireMember(ledgerId: string, memberId: string): Promise<void> {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, ledgerId, deletedAt: null, status: 'active' },
      select: { id: true }
    });
    if (!member) {
      throw notFound('MEMBER_NOT_FOUND', 'Member not found.');
    }
  }

  private async requireProject(ledgerId: string, projectId: string): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ledgerId, deletedAt: null, status: 'active' },
      select: { id: true }
    });
    if (!project) {
      throw notFound('PROJECT_NOT_FOUND', 'Project not found.');
    }
  }

  private async requireMerchant(ledgerId: string, merchantId: string): Promise<void> {
    const merchant = await this.prisma.merchant.findFirst({
      where: { id: merchantId, ledgerId, deletedAt: null, status: 'active' },
      select: { id: true }
    });
    if (!merchant) {
      throw notFound('MERCHANT_NOT_FOUND', 'Merchant not found.');
    }
  }
}

function missingExistingMoney(): never {
  throw new ApiError('ENTRY_AMOUNT_REQUIRED', 'Entry amount is required.');
}
