import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createIntegrationApp, login, resetDatabase } from '../test/integration-test-utils';

describe('Ledger CRUD integration', () => {
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

  it('creates, lists, updates, and soft-deletes a ledger with CSRF protection', async () => {
    const auth = await login(app);

    await auth.agent
      .post('/ledgers')
      .send({ name: 'Missing CSRF', baseCurrency: 'AUD', timezone: 'Australia/Melbourne' })
      .expect(403);

    const createResponse = await auth.agent
      .post('/ledgers')
      .set('x-csrf-token', auth.csrfToken)
      .send({ name: 'Household', baseCurrency: 'AUD', timezone: 'Australia/Melbourne' })
      .expect(201);

    const ledgerId = createResponse.body.ledger.id as string;
    expect(createResponse.body.ledger.baseCurrency).toBe('AUD');

    const listResponse = await auth.agent.get('/ledgers').expect(200);
    expect(listResponse.body.ledgers).toHaveLength(1);

    const updateResponse = await auth.agent
      .patch(`/ledgers/${ledgerId}`)
      .set('x-csrf-token', auth.csrfToken)
      .send({ name: 'Household 2026' })
      .expect(200);
    expect(updateResponse.body.ledger.name).toBe('Household 2026');

    await auth.agent.delete(`/ledgers/${ledgerId}`).set('x-csrf-token', auth.csrfToken).expect(204);
    const afterDelete = await auth.agent.get('/ledgers').expect(200);
    expect(afterDelete.body.ledgers).toHaveLength(0);
  });
});
