import type { Entry, EntryType } from '@qdd/shared';
import { MONEY_DECIMAL_PLACES, FX_RATE_DECIMAL_PLACES } from '@qdd/shared';

type DecimalLike = {
  toFixed(decimalPlaces?: number): string;
  toString(): string;
};

type EntryRecord = {
  id: string;
  ledgerId: string;
  type: string;
  occurredAt: Date;
  originalAmount: DecimalLike;
  originalCurrency: string;
  fxRate: DecimalLike;
  baseAmount: DecimalLike;
  baseCurrency: string;
  categoryId: string | null;
  memberId: string | null;
  merchantId: string | null;
  projectId: string | null;
  note: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  deletedAt: Date | null;
};

function toIso(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

function decimalToFixed(value: DecimalLike, decimalPlaces: number): string {
  return value.toFixed(decimalPlaces);
}

function toEntryType(value: string): EntryType {
  return value === 'Income' ? 'Income' : 'Expense';
}

export function mapEntry(record: EntryRecord): Entry {
  return {
    id: record.id,
    ledgerId: record.ledgerId,
    type: toEntryType(record.type),
    occurredAt: record.occurredAt.toISOString(),
    originalAmount: decimalToFixed(record.originalAmount, MONEY_DECIMAL_PLACES),
    originalCurrency: record.originalCurrency,
    fxRate: decimalToFixed(record.fxRate, FX_RATE_DECIMAL_PLACES),
    baseAmount: decimalToFixed(record.baseAmount, MONEY_DECIMAL_PLACES),
    baseCurrency: record.baseCurrency,
    categoryId: record.categoryId,
    memberId: record.memberId,
    merchantId: record.merchantId,
    projectId: record.projectId,
    note: record.note,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    version: record.version,
    deletedAt: toIso(record.deletedAt)
  };
}

export function decimalLikeToFixed(value: DecimalLike, decimalPlaces: number): string {
  return decimalToFixed(value, decimalPlaces);
}
