import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

import { healthResponseSchema } from '@qdd/shared';

import { AppModule } from '../app.module';

describe('HealthController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves a typed health response at /health', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);
    const payload = healthResponseSchema.parse(response.body);

    expect(payload.status).toBe('ok');
    expect(payload.service).toBe('api');
  });
});
