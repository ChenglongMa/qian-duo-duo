import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type {
  Category,
  CategoryTreeNode,
  CategoryYamlDocument,
  CategoryYamlNode,
  CreateLedgerRequest,
  EntityStatus,
  Merchant,
  UpdateLedgerRequest
} from '@qdd/shared';

import { AuditService } from '../audit/audit.service';
import { ApiError, notFound } from '../common/api-error';
import type { QddRequest } from '../common/request-context';
import { getActor, getRequestId } from '../common/request-context';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryYamlService } from './category-yaml.service';
import {
  buildCategoryTree,
  mapCategory,
  mapLedger,
  mapMerchant,
  mapNamedMasterData,
  normalizeMerchantName
} from './mappers';

const MEMBER_PRESETS = ['Family', 'Husband', 'Wife', 'Kids', 'Pets'];
const PROJECT_PRESETS = ['Renovation', 'Pets', 'Travel', 'Car'];

type CategorySnapshotItem = {
  stableKey: string;
  parentStableKey: string | null;
  name: string;
  sortOrder: number;
  status: EntityStatus;
};

type CategorySnapshot = {
  categories: CategorySnapshotItem[];
};

type AuditContext = {
  actorId: string | null;
  actorLabel: string;
  requestId: string;
};

function auditContextFromRequest(request: QddRequest): AuditContext {
  return {
    ...getActor(request),
    requestId: getRequestId(request)
  };
}

function statusValue(status: EntityStatus | undefined): string {
  return status ?? 'active';
}

function ensureStatus(value: string): EntityStatus {
  return value === 'inactive' ? 'inactive' : 'active';
}

@Injectable()
export class MasterDataService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(AuditService)
    private readonly audit: AuditService,
    @Inject(CategoryYamlService)
    private readonly yaml: CategoryYamlService
  ) {}

  async listLedgers() {
    const ledgers = await this.prisma.ledger.findMany({
      where: { deletedAt: null },
      orderBy: [{ createdAt: 'asc' }]
    });

    return { ledgers: ledgers.map(mapLedger) };
  }

  async createLedger(input: CreateLedgerRequest, request: QddRequest) {
    const auditContext = auditContextFromRequest(request);
    const ledger = await this.prisma.$transaction(async (tx) => {
      const created = await tx.ledger.create({
        data: {
          name: input.name,
          baseCurrency: input.baseCurrency,
          timezone: input.timezone
        }
      });

      await tx.member.createMany({
        data: MEMBER_PRESETS.map((name, index) => ({
          ledgerId: created.id,
          name,
          sortOrder: index
        }))
      });

      await tx.project.createMany({
        data: PROJECT_PRESETS.map((name, index) => ({
          ledgerId: created.id,
          name,
          sortOrder: index
        }))
      });

      return created;
    });

    await this.audit.record({
      ...auditContext,
      action: 'ledger.create',
      entityType: 'ledger',
      entityId: ledger.id,
      ledgerId: ledger.id,
      metadata: { name: ledger.name }
    });

    return { ledger: mapLedger(ledger) };
  }

  async getLedger(ledgerId: string) {
    const ledger = await this.prisma.ledger.findFirst({
      where: { id: ledgerId, deletedAt: null }
    });
    if (!ledger) {
      throw notFound('LEDGER_NOT_FOUND', 'Ledger not found.');
    }

    return { ledger: mapLedger(ledger) };
  }

  async updateLedger(ledgerId: string, input: UpdateLedgerRequest, request: QddRequest) {
    await this.requireLedger(ledgerId);
    const updateData: Prisma.LedgerUncheckedUpdateInput = {
      version: { increment: 1 }
    };
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.baseCurrency !== undefined) {
      updateData.baseCurrency = input.baseCurrency;
    }
    if (input.timezone !== undefined) {
      updateData.timezone = input.timezone;
    }

    const ledger = await this.prisma.ledger.update({
      where: { id: ledgerId },
      data: updateData
    });

    await this.audit.record({
      ...auditContextFromRequest(request),
      action: 'ledger.update',
      entityType: 'ledger',
      entityId: ledgerId,
      ledgerId,
      metadata: { fields: Object.keys(input) }
    });

    return { ledger: mapLedger(ledger) };
  }

  async deleteLedger(ledgerId: string, request: QddRequest): Promise<void> {
    await this.requireLedger(ledgerId);
    await this.prisma.ledger.update({
      where: { id: ledgerId },
      data: {
        deletedAt: new Date(),
        version: { increment: 1 }
      }
    });

    await this.audit.record({
      ...auditContextFromRequest(request),
      action: 'ledger.delete',
      entityType: 'ledger',
      entityId: ledgerId,
      ledgerId,
      metadata: {}
    });
  }

  async listCategories(ledgerId: string): Promise<{ categories: Category[]; tree: CategoryTreeNode[] }> {
    await this.requireLedger(ledgerId);
    const categories = await this.readCategories(ledgerId);
    return {
      categories,
      tree: buildCategoryTree(categories)
    };
  }

  async createCategory(
    ledgerId: string,
    input: {
      stableKey: string;
      parentId?: string | null;
      name: string;
      sortOrder: number;
      status: EntityStatus;
    },
    request: QddRequest
  ) {
    await this.requireLedger(ledgerId);
    if (input.parentId) {
      await this.requireCategory(ledgerId, input.parentId);
    }

    const category = await this.prisma.category.create({
      data: {
        ledgerId,
        stableKey: input.stableKey,
        parentId: input.parentId ?? null,
        name: input.name,
        sortOrder: input.sortOrder,
        status: statusValue(input.status)
      }
    });

    await this.createCategorySnapshot(ledgerId, 'manual_change', auditContextFromRequest(request));
    await this.audit.record({
      ...auditContextFromRequest(request),
      action: 'category.create',
      entityType: 'category',
      entityId: category.id,
      ledgerId,
      metadata: { stableKey: category.stableKey }
    });

    return { category: mapCategory(category) };
  }

  async updateCategory(
    ledgerId: string,
    categoryId: string,
    input: {
      parentId?: string | null;
      name?: string;
      sortOrder?: number;
      status?: EntityStatus;
    },
    request: QddRequest
  ) {
    await this.requireLedger(ledgerId);
    await this.requireCategory(ledgerId, categoryId);
    if (input.parentId) {
      if (input.parentId === categoryId) {
        throw new ApiError('CATEGORY_INVALID_PARENT', 'A category cannot be its own parent.');
      }
      await this.requireCategory(ledgerId, input.parentId);
    }

    const updateData: Prisma.CategoryUncheckedUpdateInput = {
      version: { increment: 1 }
    };
    if ('parentId' in input) {
      updateData.parentId = input.parentId ?? null;
    }
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.sortOrder !== undefined) {
      updateData.sortOrder = input.sortOrder;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    const category = await this.prisma.category.update({
      where: { id: categoryId },
      data: updateData
    });

    await this.createCategorySnapshot(ledgerId, 'manual_change', auditContextFromRequest(request));
    await this.audit.record({
      ...auditContextFromRequest(request),
      action: 'category.update',
      entityType: 'category',
      entityId: category.id,
      ledgerId,
      metadata: { stableKey: category.stableKey, fields: Object.keys(input) }
    });

    return { category: mapCategory(category) };
  }

  async deleteCategory(ledgerId: string, categoryId: string, request: QddRequest): Promise<void> {
    await this.requireLedger(ledgerId);
    await this.requireCategory(ledgerId, categoryId);
    const category = await this.prisma.category.update({
      where: { id: categoryId },
      data: {
        status: 'inactive',
        deletedAt: new Date(),
        version: { increment: 1 }
      }
    });

    await this.createCategorySnapshot(ledgerId, 'manual_change', auditContextFromRequest(request));
    await this.audit.record({
      ...auditContextFromRequest(request),
      action: 'category.delete',
      entityType: 'category',
      entityId: category.id,
      ledgerId,
      metadata: { stableKey: category.stableKey }
    });
  }

  validateCategoryYaml(yamlText: string) {
    const result = this.yaml.validate(yamlText);
    return {
      valid: result.errors.length === 0,
      errors: result.errors
    };
  }

  async importCategoryYaml(ledgerId: string, yamlText: string, request: QddRequest) {
    await this.requireLedger(ledgerId);
    const result = this.yaml.validate(yamlText);
    if (!result.document) {
      throw new ApiError('CATEGORY_YAML_INVALID', 'Category YAML is invalid.', HttpStatus.BAD_REQUEST, {
        errors: result.errors
      });
    }

    await this.applyCategoryDocument(ledgerId, result.document);
    const versionNumber = await this.createCategorySnapshot(
      ledgerId,
      'yaml_import',
      auditContextFromRequest(request)
    );
    const categories = await this.readCategories(ledgerId);

    await this.audit.record({
      ...auditContextFromRequest(request),
      action: 'category.yaml_import',
      entityType: 'category',
      ledgerId,
      metadata: { imported: categories.length, versionNumber }
    });

    return {
      imported: categories.length,
      versionNumber,
      categories
    };
  }

  async exportCategoryYaml(ledgerId: string, request: QddRequest) {
    await this.requireLedger(ledgerId);
    const snapshot = await this.snapshotCategories(ledgerId);
    const document: CategoryYamlDocument = {
      version: 1,
      categories: this.snapshotToYamlTree(snapshot.categories)
    };
    const latestVersion = await this.prisma.categoryVersion.findFirst({
      where: { ledgerId },
      orderBy: { versionNumber: 'desc' }
    });

    await this.audit.record({
      ...auditContextFromRequest(request),
      action: 'category.yaml_export',
      entityType: 'category',
      ledgerId,
      metadata: { versionNumber: latestVersion?.versionNumber ?? null }
    });

    return {
      yaml: this.yaml.stringify(document),
      versionNumber: latestVersion?.versionNumber ?? null
    };
  }

  async rollbackCategories(
    ledgerId: string,
    versionNumber: number,
    request: QddRequest
  ): Promise<{
    restoredVersionNumber: number;
    newVersionNumber: number;
    categories: Category[];
  }> {
    await this.requireLedger(ledgerId);
    const version = await this.prisma.categoryVersion.findFirst({
      where: { ledgerId, versionNumber }
    });
    if (!version) {
      throw notFound('CATEGORY_VERSION_NOT_FOUND', 'Category version not found.');
    }

    const snapshot = this.parseSnapshot(version.snapshot);
    await this.applySnapshot(ledgerId, snapshot);
    const newVersionNumber = await this.createCategorySnapshot(
      ledgerId,
      'rollback',
      auditContextFromRequest(request)
    );
    const categories = await this.readCategories(ledgerId);

    await this.audit.record({
      ...auditContextFromRequest(request),
      action: 'category.rollback',
      entityType: 'category_version',
      entityId: version.id,
      ledgerId,
      metadata: { restoredVersionNumber: versionNumber, newVersionNumber }
    });

    return {
      restoredVersionNumber: versionNumber,
      newVersionNumber,
      categories
    };
  }

  async copyCategories(ledgerId: string, sourceLedgerId: string, request: QddRequest) {
    await this.requireLedger(ledgerId);
    await this.requireLedger(sourceLedgerId);
    const snapshot = await this.snapshotCategories(sourceLedgerId);
    await this.applySnapshot(ledgerId, snapshot);
    const versionNumber = await this.createCategorySnapshot(
      ledgerId,
      'copy_from_ledger',
      auditContextFromRequest(request)
    );
    const categories = await this.readCategories(ledgerId);

    await this.audit.record({
      ...auditContextFromRequest(request),
      action: 'category.copy_from_ledger',
      entityType: 'category',
      ledgerId,
      metadata: { sourceLedgerId, versionNumber }
    });

    return {
      imported: categories.length,
      versionNumber,
      categories
    };
  }

  async listMembers(ledgerId: string) {
    await this.requireLedger(ledgerId);
    const members = await this.prisma.member.findMany({
      where: { ledgerId, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
    });
    return { members: members.map(mapNamedMasterData) };
  }

  async createMember(ledgerId: string, input: { name: string; sortOrder: number; status: EntityStatus }, request: QddRequest) {
    await this.requireLedger(ledgerId);
    const member = await this.prisma.member.create({
      data: { ledgerId, name: input.name, sortOrder: input.sortOrder, status: input.status }
    });
    await this.recordMasterDataAudit('member.create', 'member', member.id, ledgerId, request);
    return { member: mapNamedMasterData(member) };
  }

  async updateMember(
    ledgerId: string,
    memberId: string,
    input: { name?: string; sortOrder?: number; status?: EntityStatus },
    request: QddRequest
  ) {
    await this.requireLedger(ledgerId);
    await this.requireMember(ledgerId, memberId);
    const member = await this.prisma.member.update({
      where: { id: memberId },
      data: { ...input, version: { increment: 1 } }
    });
    await this.recordMasterDataAudit('member.update', 'member', member.id, ledgerId, request);
    return { member: mapNamedMasterData(member) };
  }

  async deleteMember(ledgerId: string, memberId: string, request: QddRequest): Promise<void> {
    await this.requireLedger(ledgerId);
    await this.requireMember(ledgerId, memberId);
    await this.prisma.member.update({
      where: { id: memberId },
      data: { status: 'inactive', deletedAt: new Date(), version: { increment: 1 } }
    });
    await this.recordMasterDataAudit('member.delete', 'member', memberId, ledgerId, request);
  }

  async listProjects(ledgerId: string) {
    await this.requireLedger(ledgerId);
    const projects = await this.prisma.project.findMany({
      where: { ledgerId, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
    });
    return { projects: projects.map(mapNamedMasterData) };
  }

  async createProject(ledgerId: string, input: { name: string; sortOrder: number; status: EntityStatus }, request: QddRequest) {
    await this.requireLedger(ledgerId);
    const project = await this.prisma.project.create({
      data: { ledgerId, name: input.name, sortOrder: input.sortOrder, status: input.status }
    });
    await this.recordMasterDataAudit('project.create', 'project', project.id, ledgerId, request);
    return { project: mapNamedMasterData(project) };
  }

  async updateProject(
    ledgerId: string,
    projectId: string,
    input: { name?: string; sortOrder?: number; status?: EntityStatus },
    request: QddRequest
  ) {
    await this.requireLedger(ledgerId);
    await this.requireProject(ledgerId, projectId);
    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: { ...input, version: { increment: 1 } }
    });
    await this.recordMasterDataAudit('project.update', 'project', project.id, ledgerId, request);
    return { project: mapNamedMasterData(project) };
  }

  async deleteProject(ledgerId: string, projectId: string, request: QddRequest): Promise<void> {
    await this.requireLedger(ledgerId);
    await this.requireProject(ledgerId, projectId);
    await this.prisma.project.update({
      where: { id: projectId },
      data: { status: 'inactive', deletedAt: new Date(), version: { increment: 1 } }
    });
    await this.recordMasterDataAudit('project.delete', 'project', projectId, ledgerId, request);
  }

  async listMerchants(ledgerId: string): Promise<{ merchants: Merchant[] }> {
    await this.requireLedger(ledgerId);
    const merchants = await this.prisma.merchant.findMany({
      where: { ledgerId, deletedAt: null },
      orderBy: [{ name: 'asc' }]
    });
    return { merchants: merchants.map(mapMerchant) };
  }

  async createMerchant(ledgerId: string, input: { name: string; status: EntityStatus }, request: QddRequest) {
    await this.requireLedger(ledgerId);
    const merchant = await this.prisma.merchant.create({
      data: {
        ledgerId,
        name: input.name,
        normalizedName: normalizeMerchantName(input.name),
        status: input.status
      }
    });
    await this.recordMasterDataAudit('merchant.create', 'merchant', merchant.id, ledgerId, request);
    return { merchant: mapMerchant(merchant) };
  }

  async updateMerchant(
    ledgerId: string,
    merchantId: string,
    input: { name?: string; status?: EntityStatus },
    request: QddRequest
  ) {
    await this.requireLedger(ledgerId);
    await this.requireMerchant(ledgerId, merchantId);
    const updateData: Prisma.MerchantUncheckedUpdateInput = {
      version: { increment: 1 }
    };
    if (input.name !== undefined) {
      updateData.name = input.name;
      updateData.normalizedName = normalizeMerchantName(input.name);
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    const merchant = await this.prisma.merchant.update({
      where: { id: merchantId },
      data: updateData
    });
    await this.recordMasterDataAudit('merchant.update', 'merchant', merchant.id, ledgerId, request);
    return { merchant: mapMerchant(merchant) };
  }

  async deleteMerchant(ledgerId: string, merchantId: string, request: QddRequest): Promise<void> {
    await this.requireLedger(ledgerId);
    await this.requireMerchant(ledgerId, merchantId);
    await this.prisma.merchant.update({
      where: { id: merchantId },
      data: { status: 'inactive', deletedAt: new Date(), version: { increment: 1 } }
    });
    await this.recordMasterDataAudit('merchant.delete', 'merchant', merchantId, ledgerId, request);
  }

  private async requireLedger(ledgerId: string): Promise<void> {
    const ledger = await this.prisma.ledger.findFirst({
      where: { id: ledgerId, deletedAt: null },
      select: { id: true }
    });
    if (!ledger) {
      throw notFound('LEDGER_NOT_FOUND', 'Ledger not found.');
    }
  }

  private async requireCategory(ledgerId: string, categoryId: string): Promise<void> {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, ledgerId, deletedAt: null },
      select: { id: true }
    });
    if (!category) {
      throw notFound('CATEGORY_NOT_FOUND', 'Category not found.');
    }
  }

  private async requireMember(ledgerId: string, memberId: string): Promise<void> {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, ledgerId, deletedAt: null },
      select: { id: true }
    });
    if (!member) {
      throw notFound('MEMBER_NOT_FOUND', 'Member not found.');
    }
  }

  private async requireProject(ledgerId: string, projectId: string): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ledgerId, deletedAt: null },
      select: { id: true }
    });
    if (!project) {
      throw notFound('PROJECT_NOT_FOUND', 'Project not found.');
    }
  }

  private async requireMerchant(ledgerId: string, merchantId: string): Promise<void> {
    const merchant = await this.prisma.merchant.findFirst({
      where: { id: merchantId, ledgerId, deletedAt: null },
      select: { id: true }
    });
    if (!merchant) {
      throw notFound('MERCHANT_NOT_FOUND', 'Merchant not found.');
    }
  }

  private async readCategories(ledgerId: string): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { ledgerId, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
    });

    return categories.map(mapCategory);
  }

  private async snapshotCategories(ledgerId: string): Promise<CategorySnapshot> {
    const categories = await this.prisma.category.findMany({
      where: { ledgerId, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
    });
    const byId = new Map(categories.map((category) => [category.id, category]));

    return {
      categories: categories.map((category) => ({
        stableKey: category.stableKey,
        parentStableKey: category.parentId ? byId.get(category.parentId)?.stableKey ?? null : null,
        name: category.name,
        sortOrder: category.sortOrder,
        status: ensureStatus(category.status)
      }))
    };
  }

  private async createCategorySnapshot(
    ledgerId: string,
    reason: string,
    auditContext: AuditContext
  ): Promise<number> {
    const snapshot = await this.snapshotCategories(ledgerId);
    const latest = await this.prisma.categoryVersion.findFirst({
      where: { ledgerId },
      orderBy: { versionNumber: 'desc' }
    });
    const versionNumber = (latest?.versionNumber ?? 0) + 1;

    await this.prisma.categoryVersion.create({
      data: {
        ledgerId,
        versionNumber,
        reason,
        snapshot: snapshot as Prisma.InputJsonObject,
        actorId: auditContext.actorId,
        actorLabel: auditContext.actorLabel,
        requestId: auditContext.requestId
      }
    });

    return versionNumber;
  }

  private async applyCategoryDocument(ledgerId: string, document: CategoryYamlDocument): Promise<void> {
    const flattened = this.flattenYamlNodes(document.categories);
    await this.applySnapshot(ledgerId, { categories: flattened });
  }

  private async applySnapshot(ledgerId: string, snapshot: CategorySnapshot): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.category.findMany({ where: { ledgerId } });
      const byStableKey = new Map(existing.map((category) => [category.stableKey, category]));
      const desiredKeys = new Set(snapshot.categories.map((category) => category.stableKey));
      const idByStableKey = new Map<string, string>();

      for (const item of snapshot.categories) {
        const existingCategory = byStableKey.get(item.stableKey);
        if (existingCategory) {
          const updated = await tx.category.update({
            where: { id: existingCategory.id },
            data: {
              name: item.name,
              sortOrder: item.sortOrder,
              status: item.status,
              deletedAt: null,
              parentId: null,
              version: { increment: 1 }
            }
          });
          idByStableKey.set(item.stableKey, updated.id);
        } else {
          const created = await tx.category.create({
            data: {
              ledgerId,
              stableKey: item.stableKey,
              name: item.name,
              sortOrder: item.sortOrder,
              status: item.status,
              parentId: null
            }
          });
          idByStableKey.set(item.stableKey, created.id);
        }
      }

      for (const item of snapshot.categories) {
        const id = idByStableKey.get(item.stableKey);
        const parentId = item.parentStableKey ? idByStableKey.get(item.parentStableKey) ?? null : null;
        if (id) {
          await tx.category.update({
            where: { id },
            data: { parentId }
          });
        }
      }

      for (const existingCategory of existing) {
        if (!desiredKeys.has(existingCategory.stableKey)) {
          await tx.category.update({
            where: { id: existingCategory.id },
            data: {
              status: 'inactive',
              parentId: null,
              version: { increment: 1 }
            }
          });
        }
      }
    });
  }

  private flattenYamlNodes(nodes: CategoryYamlNode[], parentStableKey: string | null = null): CategorySnapshotItem[] {
    return nodes.flatMap((node, index) => {
      const item: CategorySnapshotItem = {
        stableKey: node.key,
        parentStableKey,
        name: node.name,
        sortOrder: index,
        status: node.status ?? 'active'
      };

      return [item, ...this.flattenYamlNodes(node.children ?? [], node.key)];
    });
  }

  private snapshotToYamlTree(categories: CategorySnapshotItem[], parentStableKey: string | null = null): CategoryYamlNode[] {
    return categories
      .filter((category) => category.parentStableKey === parentStableKey)
      .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name))
      .map((category) => {
        const children = this.snapshotToYamlTree(categories, category.stableKey);
        const node: CategoryYamlNode = {
          key: category.stableKey,
          name: category.name
        };
        if (category.status === 'inactive') {
          node.status = 'inactive';
        }
        if (children.length > 0) {
          node.children = children;
        }
        return node;
      });
  }

  private parseSnapshot(value: unknown): CategorySnapshot {
    const snapshot = value as Partial<CategorySnapshot>;
    if (!Array.isArray(snapshot.categories)) {
      throw new ApiError('CATEGORY_SNAPSHOT_INVALID', 'Stored category snapshot is invalid.');
    }

    return {
      categories: snapshot.categories.map((item) => {
        const candidate = item as Partial<CategorySnapshotItem>;
        if (!candidate.stableKey || !candidate.name) {
          throw new ApiError('CATEGORY_SNAPSHOT_INVALID', 'Stored category snapshot is invalid.');
        }

        return {
          stableKey: candidate.stableKey,
          parentStableKey: candidate.parentStableKey ?? null,
          name: candidate.name,
          sortOrder: candidate.sortOrder ?? 0,
          status: candidate.status ?? 'active'
        };
      })
    };
  }

  private async recordMasterDataAudit(
    action: string,
    entityType: string,
    entityId: string,
    ledgerId: string,
    request: QddRequest
  ): Promise<void> {
    await this.audit.record({
      ...auditContextFromRequest(request),
      action,
      entityType,
      entityId,
      ledgerId,
      metadata: {}
    });
  }
}
