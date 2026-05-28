import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client';

const DEFAULT_LOCAL_DATABASE_URL =
  'postgresql://qdd:qdd_dev_password@localhost:15432/qdd_dev?schema=public';

export function resolveDatabaseUrl(): string {
  return process.env.DATABASE_URL ?? DEFAULT_LOCAL_DATABASE_URL;
}

export function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: resolveDatabaseUrl() })
  });
}
