import { describe, expect, it } from 'vitest';

import { HEALTH_CONTRACT_VERSION, healthResponseSchema, parseHealthResponse } from './health';

describe('healthResponseSchema', () => {
  it('accepts a typed API health response', () => {
    const response = parseHealthResponse({
      status: 'ok',
      service: 'api',
      version: '0.0.0',
      timestamp: '2026-05-29T00:00:00.000Z',
      uptimeSeconds: 1.25,
      contractVersion: HEALTH_CONTRACT_VERSION
    });

    expect(response.status).toBe('ok');
  });

  it('rejects unknown fields', () => {
    const result = healthResponseSchema.safeParse({
      status: 'ok',
      service: 'api',
      version: '0.0.0',
      timestamp: '2026-05-29T00:00:00.000Z',
      uptimeSeconds: 1,
      contractVersion: HEALTH_CONTRACT_VERSION,
      unsafe: true
    });

    expect(result.success).toBe(false);
  });
});
