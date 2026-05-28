import 'dotenv/config';

import { PasswordHasherService } from '../src/auth/password-hasher.service';
import { assertPasswordPolicy } from '../src/auth/password-policy';
import { createPrismaClient } from '../src/prisma/create-prisma-client';

const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'ReplaceWithStrongLocalPassword!2026';

async function main(): Promise<void> {
  const prisma = createPrismaClient();
  const username = process.env.ADMIN_USERNAME ?? DEFAULT_ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;

  assertPasswordPolicy(password);
  const passwordHash = await new PasswordHasherService().hash(password);

  await prisma.adminAccount.upsert({
    where: { singletonKey: 'single_admin' },
    update: {
      username,
      passwordHash
    },
    create: {
      singletonKey: 'single_admin',
      username,
      passwordHash
    }
  });

  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
