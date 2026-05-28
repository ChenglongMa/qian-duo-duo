import { Injectable } from '@nestjs/common';
import {
  HEALTH_CONTRACT_VERSION,
  healthResponseSchema,
  type HealthResponse
} from '@qdd/shared';

@Injectable()
export class HealthService {
  getHealth(): HealthResponse {
    return healthResponseSchema.parse({
      status: 'ok',
      service: 'api',
      version: process.env.npm_package_version ?? '0.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Number(process.uptime().toFixed(3)),
      contractVersion: HEALTH_CONTRACT_VERSION
    });
  }
}
