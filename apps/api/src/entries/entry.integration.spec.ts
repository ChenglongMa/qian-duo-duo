import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  type AuthenticatedAgent,
  createIntegrationApp,
  createLedger,
  login,
  resetDatabase
} from '../test/integration-test-utils';
import { createPrismaClient } from '../prisma/create-prisma-client';

async function createCategory(auth: AuthenticatedAgent, ledgerId: string, stableKey = 'food'): Promise<string> {
  const response = await auth.agent
    .post(`/ledgers/${ledgerId}/categories`)
    .set('x-csrf-token', auth.csrfToken)
    .send({ stableKey, name: stableKey === 'food' ? 'Food' : 'Travel', sortOrder: 1 })
    .expect(201);

  return response.body.category.id as string;
}

async function firstMember(auth: AuthenticatedAgent, ledgerId: string): Promise<string> {
  const response = await auth.agent.get(`/ledgers/${ledgerId}/members`).expect(200);
  const members = response.body.members as Array<{ id: string; name: string }>;
  const family = members.find((member) => member.name === 'Family');
  if (!family) {
    throw new Error('Expected seeded Family member.');
  }

  return family.id;
}

async function createMerchant(auth: AuthenticatedAgent, ledgerId: string): Promise<string> {
  const response = await auth.agent
    .post(`/ledgers/${ledgerId}/merchants`)
    .set('x-csrf-token', auth.csrfToken)
    .send({ name: 'Market Lane' })
    .expect(201);

  return response.body.merchant.id as string;
}

async function firstProject(auth: AuthenticatedAgent, ledgerId: string): Promise<string> {
  const response = await auth.agent.get(`/ledgers/${ledgerId}/projects`).expect(200);
  const projects = response.body.projects as Array<{ id: string; name: string }>;
  const travel = projects.find((project) => project.name === 'Travel');
  if (!travel) {
    throw new Error('Expected seeded Travel project.');
  }

  return travel.id;
}

describe('Entry CRUD integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await resetDatabase();
    app = await createIntegrationApp();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates, lists, updates, clones, and soft-deletes entries', async () => {
    const auth = await login(app);
    const ledgerId = await createLedger(auth);
    const categoryId = await createCategory(auth, ledgerId);
    const memberId = await firstMember(auth, ledgerId);
    const merchantId = await createMerchant(auth, ledgerId);
    const projectId = await firstProject(auth, ledgerId);

    const createResponse = await auth.agent
      .post(`/ledgers/${ledgerId}/entries`)
      .set('x-csrf-token', auth.csrfToken)
      .send({
        type: 'Expense',
        occurredAt: '2026-05-29T02:00:00.000Z',
        originalAmount: '10.00',
        originalCurrency: 'USD',
        fxRate: '1.50000000',
        categoryId,
        memberId,
        merchantId,
        projectId,
        note: 'Lunch'
      })
      .expect(201);

    const entryId = createResponse.body.entry.id as string;
    expect(createResponse.body.entry.baseAmount).toBe('15.0000');
    expect(createResponse.body.entry.baseCurrency).toBe('AUD');

    const listResponse = await auth.agent
      .get(`/ledgers/${ledgerId}/entries`)
      .query({ type: 'Expense', sortBy: 'occurredAt', sortDirection: 'desc' })
      .expect(200);
    expect(listResponse.body.entries).toHaveLength(1);

    const updateResponse = await auth.agent
      .patch(`/ledgers/${ledgerId}/entries/${entryId}`)
      .set('x-csrf-token', auth.csrfToken)
      .send({ originalAmount: '12.50', note: 'Lunch updated' })
      .expect(200);
    expect(updateResponse.body.entry.baseAmount).toBe('18.7500');
    expect(updateResponse.body.entry.version).toBe(2);

    const cloneResponse = await auth.agent
      .post(`/ledgers/${ledgerId}/entries/${entryId}/clone`)
      .set('x-csrf-token', auth.csrfToken)
      .expect(201);
    const cloneId = cloneResponse.body.entry.id as string;
    expect(cloneId).not.toBe(entryId);
    expect(cloneResponse.body.entry.note).toBe('Lunch updated');

    await auth.agent.delete(`/ledgers/${ledgerId}/entries/${entryId}`).set('x-csrf-token', auth.csrfToken).expect(204);

    await auth.agent.get(`/ledgers/${ledgerId}/entries/${entryId}`).expect(404);

    const afterDelete = await auth.agent.get(`/ledgers/${ledgerId}/entries`).expect(200);
    expect(afterDelete.body.entries.map((entry: { id: string }) => entry.id)).toEqual([cloneId]);

    const prisma = createPrismaClient();
    const auditActions = await prisma.auditLog.findMany({
      where: { ledgerId, action: { in: ['entry.create', 'entry.update', 'entry.clone', 'entry.delete'] } },
      orderBy: { createdAt: 'asc' }
    });
    await prisma.$disconnect();
    expect(auditActions.map((event) => event.action)).toEqual([
      'entry.create',
      'entry.update',
      'entry.clone',
      'entry.delete'
    ]);
  });

  it('hides soft-deleted entries from normal list endpoints', async () => {
    const auth = await login(app);
    const ledgerId = await createLedger(auth);
    const categoryId = await createCategory(auth, ledgerId);
    const memberId = await firstMember(auth, ledgerId);

    const first = await auth.agent
      .post(`/ledgers/${ledgerId}/entries`)
      .set('x-csrf-token', auth.csrfToken)
      .send({
        type: 'Expense',
        originalAmount: '8.00',
        categoryId,
        memberId,
        note: 'Hidden after delete'
      })
      .expect(201);

    const second = await auth.agent
      .post(`/ledgers/${ledgerId}/entries`)
      .set('x-csrf-token', auth.csrfToken)
      .send({
        type: 'Income',
        originalAmount: '25.00',
        categoryId,
        memberId,
        note: 'Still visible'
      })
      .expect(201);

    await auth.agent
      .delete(`/ledgers/${ledgerId}/entries/${first.body.entry.id as string}`)
      .set('x-csrf-token', auth.csrfToken)
      .expect(204);

    const list = await auth.agent.get(`/ledgers/${ledgerId}/entries`).expect(200);
    expect(list.body.entries.map((entry: { id: string }) => entry.id)).toEqual([second.body.entry.id]);
  });
});
