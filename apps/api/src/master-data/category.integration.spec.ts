import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createIntegrationApp, createLedger, login, resetDatabase } from '../test/integration-test-utils';

describe('Category integration', () => {
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

  it('creates categories and returns a typed tree', async () => {
    const auth = await login(app);
    const ledgerId = await createLedger(auth);

    const parent = await auth.agent
      .post(`/ledgers/${ledgerId}/categories`)
      .set('x-csrf-token', auth.csrfToken)
      .send({ stableKey: 'food', name: 'Food', sortOrder: 1 })
      .expect(201);

    await auth.agent
      .post(`/ledgers/${ledgerId}/categories`)
      .set('x-csrf-token', auth.csrfToken)
      .send({
        stableKey: 'groceries',
        parentId: parent.body.category.id,
        name: 'Groceries',
        sortOrder: 1
      })
      .expect(201);

    const response = await auth.agent.get(`/ledgers/${ledgerId}/categories`).expect(200);
    expect(response.body.tree[0].stableKey).toBe('food');
    expect(response.body.tree[0].children[0].stableKey).toBe('groceries');
  });

  it('rejects invalid YAML with clear error codes', async () => {
    const auth = await login(app);
    const ledgerId = await createLedger(auth);

    const response = await auth.agent
      .post(`/ledgers/${ledgerId}/categories/yaml/import`)
      .set('x-csrf-token', auth.csrfToken)
      .send({
        yaml: 'version: 1\ncategories:\n  - key: food\n    name: Food\n  - key: food\n    name: Food again\n'
      })
      .expect(400);

    expect(response.body.error.code).toBe('CATEGORY_YAML_INVALID');
    expect(response.body.error.details.errors[0].code).toBe('CATEGORY_DUPLICATE_KEY');
  });

  it('imports YAML snapshots and rolls back to a prior version safely', async () => {
    const auth = await login(app);
    const ledgerId = await createLedger(auth);

    const firstImport = await auth.agent
      .post(`/ledgers/${ledgerId}/categories/yaml/import`)
      .set('x-csrf-token', auth.csrfToken)
      .send({
        yaml: 'version: 1\ncategories:\n  - key: food\n    name: Food\n'
      })
      .expect(201);

    await auth.agent
      .post(`/ledgers/${ledgerId}/categories/yaml/import`)
      .set('x-csrf-token', auth.csrfToken)
      .send({
        yaml: 'version: 1\ncategories:\n  - key: travel\n    name: Travel\n'
      })
      .expect(201);

    const rollback = await auth.agent
      .post(`/ledgers/${ledgerId}/categories/rollback`)
      .set('x-csrf-token', auth.csrfToken)
      .send({ versionNumber: firstImport.body.versionNumber, confirmation: 'ROLLBACK CATEGORIES' })
      .expect(201);

    expect(rollback.body.restoredVersionNumber).toBe(firstImport.body.versionNumber);

    const list = await auth.agent.get(`/ledgers/${ledgerId}/categories`).expect(200);
    const keys = list.body.categories.map((category: { stableKey: string }) => category.stableKey);
    expect(keys).toContain('food');
    expect(keys).toContain('travel');
    const travel = list.body.categories.find((category: { stableKey: string }) => category.stableKey === 'travel');
    expect(travel.status).toBe('inactive');
  });
});
