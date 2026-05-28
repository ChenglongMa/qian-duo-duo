import * as z from 'zod';

export const HEALTH_CONTRACT_VERSION = '1.0.0';

export const healthStatusSchema = z.enum(['ok']);

export const healthResponseSchema = z
  .object({
    status: healthStatusSchema,
    service: z.literal('api'),
    version: z.string().min(1),
    timestamp: z.iso.datetime(),
    uptimeSeconds: z.number().nonnegative(),
    contractVersion: z.literal(HEALTH_CONTRACT_VERSION)
  })
  .strict();

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export function parseHealthResponse(value: unknown): HealthResponse {
  return healthResponseSchema.parse(value);
}
