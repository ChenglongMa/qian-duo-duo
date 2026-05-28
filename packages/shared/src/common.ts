import { z } from 'zod';

export const uuidSchema = z.uuid();

export const currencyCodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{3}$/, 'Use an ISO 4217-style uppercase currency code.');

export const timezoneSchema = z.string().trim().min(1).max(100);

export const nonEmptyNameSchema = z.string().trim().min(1).max(120);

export const stableKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9][a-z0-9_-]*$/, 'Use lowercase letters, numbers, underscores, or hyphens.');

export const isoDateTimeStringSchema = z.string().min(1);

export const syncMetadataSchema = z.object({
  id: uuidSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  version: z.number().int().positive(),
  deletedAt: isoDateTimeStringSchema.nullable()
});

export const errorDetailSchema = z.record(z.string(), z.unknown());

export const apiErrorBodySchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    details: errorDetailSchema,
    requestId: z.string().min(1)
  })
});

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;
