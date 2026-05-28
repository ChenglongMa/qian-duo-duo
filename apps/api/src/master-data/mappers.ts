import type {
  Category,
  CategoryTreeNode,
  EntityStatus,
  Ledger,
  Merchant,
  NamedMasterData
} from '@qdd/shared';

type SyncRecord = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  deletedAt: Date | null;
};

type LedgerRecord = SyncRecord & {
  name: string;
  baseCurrency: string;
  timezone: string;
};

type CategoryRecord = SyncRecord & {
  ledgerId: string;
  stableKey: string;
  parentId: string | null;
  name: string;
  sortOrder: number;
  status: string;
};

type NamedRecord = SyncRecord & {
  ledgerId: string;
  name: string;
  sortOrder: number;
  status: string;
};

type MerchantRecord = SyncRecord & {
  ledgerId: string;
  name: string;
  normalizedName: string;
  status: string;
};

function toIso(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

function toStatus(value: string): EntityStatus {
  return value === 'inactive' ? 'inactive' : 'active';
}

export function mapLedger(record: LedgerRecord): Ledger {
  return {
    id: record.id,
    name: record.name,
    baseCurrency: record.baseCurrency,
    timezone: record.timezone,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    version: record.version,
    deletedAt: toIso(record.deletedAt)
  };
}

export function mapCategory(record: CategoryRecord): Category {
  return {
    id: record.id,
    ledgerId: record.ledgerId,
    stableKey: record.stableKey,
    parentId: record.parentId,
    name: record.name,
    sortOrder: record.sortOrder,
    status: toStatus(record.status),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    version: record.version,
    deletedAt: toIso(record.deletedAt)
  };
}

export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const nodes = new Map<string, CategoryTreeNode>();
  for (const category of categories) {
    nodes.set(category.id, { ...category, children: [] });
  }

  const roots: CategoryTreeNode[] = [];
  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      const parent = nodes.get(node.parentId);
      parent?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortTree = (items: CategoryTreeNode[]): CategoryTreeNode[] => {
    items.sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name));
    for (const item of items) {
      sortTree(item.children);
    }
    return items;
  };

  return sortTree(roots);
}

export function mapNamedMasterData(record: NamedRecord): NamedMasterData {
  return {
    id: record.id,
    ledgerId: record.ledgerId,
    name: record.name,
    sortOrder: record.sortOrder,
    status: toStatus(record.status),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    version: record.version,
    deletedAt: toIso(record.deletedAt)
  };
}

export function mapMerchant(record: MerchantRecord): Merchant {
  return {
    id: record.id,
    ledgerId: record.ledgerId,
    name: record.name,
    normalizedName: record.normalizedName,
    status: toStatus(record.status),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    version: record.version,
    deletedAt: toIso(record.deletedAt)
  };
}

export function normalizeMerchantName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}
