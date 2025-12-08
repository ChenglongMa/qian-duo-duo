import Dexie, { Table } from 'dexie';

export interface LocalEntry {
  id?: number;
  tempId: string;
  payload: Record<string, unknown>;
  createdAt: number;
}

class QddDb extends Dexie {
  entries!: Table<LocalEntry, number>;

  constructor() {
    super('qdd-offline');
    this.version(1).stores({
      entries: '++id, createdAt'
    });
  }
}

export const db = new QddDb();
