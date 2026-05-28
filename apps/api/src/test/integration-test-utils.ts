import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../app.module';
import { setupApplication } from '../app.setup';
import { PasswordHasherService } from '../auth/password-hasher.service';
import { createPrismaClient } from '../prisma/create-prisma-client';

export const TEST_ADMIN_USERNAME = 'admin';
export const TEST_ADMIN_PASSWORD = 'CorrectHorse!2026';

export type AuthenticatedAgent = {
  agent: ReturnType<typeof request.agent>;
  csrfToken: string;
};

export async function resetDatabase(): Promise<void> {
  const prisma = createPrismaClient();
  await prisma.adminSession.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.categoryVersion.deleteMany();
  await prisma.category.deleteMany();
  await prisma.member.deleteMany();
  await prisma.project.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.ruleVersion.deleteMany();
  await prisma.ledger.deleteMany();
  await prisma.adminAccount.deleteMany();

  const passwordHash = await new PasswordHasherService().hash(TEST_ADMIN_PASSWORD);
  await prisma.adminAccount.upsert({
    where: { singletonKey: 'single_admin' },
    update: {
      username: TEST_ADMIN_USERNAME,
      passwordHash
    },
    create: {
      singletonKey: 'single_admin',
      username: TEST_ADMIN_USERNAME,
      passwordHash
    }
  });

  await prisma.$disconnect();
}

export async function createIntegrationApp(): Promise<INestApplication> {
  process.env.SESSION_SECRET = 'integration-test-session-secret';
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();

  const app = moduleRef.createNestApplication();
  setupApplication(app);
  await app.init();
  return app;
}

export async function login(app: INestApplication): Promise<AuthenticatedAgent> {
  const agent = request.agent(app.getHttpServer());
  const response = await agent
    .post('/auth/login')
    .send({ username: TEST_ADMIN_USERNAME, password: TEST_ADMIN_PASSWORD })
    .expect(201);

  return {
    agent,
    csrfToken: response.body.csrfToken as string
  };
}

export async function createLedger(auth: AuthenticatedAgent): Promise<string> {
  const response = await auth.agent
    .post('/ledgers')
    .set('x-csrf-token', auth.csrfToken)
    .send({ name: 'Home', baseCurrency: 'AUD', timezone: 'Australia/Melbourne' })
    .expect(201);

  return response.body.ledger.id as string;
}
