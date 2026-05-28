import { describe, expect, it } from 'vitest';

import { healthResponseSchema } from '@qdd/shared';

import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns a schema-valid health payload', () => {
    const service = new HealthService();
    const payload = service.getHealth();

    expect(healthResponseSchema.safeParse(payload).success).toBe(true);
    expect(payload.status).toBe('ok');
  });
});
