import { z } from 'zod';

import {
  currencyCodeSchema,
  isoDateTimeStringSchema,
  syncMetadataSchema,
  uuidSchema
} from './common';
import { normalizeFxRate, normalizeMoneyAmount } from './money';

function fixedDecimalSchema(
  normalize: (value: string) => ReturnType<typeof normalizeMoneyAmount>,
  fallbackLabel: string
): z.ZodType<string, string> {
  return z.string().trim().transform((value, context) => {
    const result = normalize(value);
    if (!result.ok) {
      context.addIssue({
        code: 'custom',
        message: result.message || `${fallbackLabel} is invalid.`
      });
      return z.NEVER;
    }

    return result.normalized;
  });
}

export const moneyAmountSchema = fixedDecimalSchema(normalizeMoneyAmount, 'Amount');
export const fxRateSchema = fixedDecimalSchema(normalizeFxRate, 'FX rate');

export const entryTypeSchema = z.enum(['Expense', 'Income']);

export const entryDateTimeSchema = isoDateTimeStringSchema.refine(
  (value) => !Number.isNaN(new Date(value).getTime()),
  'Use a valid ISO datetime.'
);

export const nullableDimensionIdSchema = uuidSchema.nullable();

export const entrySchema = syncMetadataSchema.extend({
  ledgerId: uuidSchema,
  type: entryTypeSchema,
  occurredAt: entryDateTimeSchema,
  originalAmount: moneyAmountSchema,
  originalCurrency: currencyCodeSchema,
  fxRate: fxRateSchema,
  baseAmount: moneyAmountSchema,
  baseCurrency: currencyCodeSchema,
  categoryId: nullableDimensionIdSchema,
  memberId: nullableDimensionIdSchema,
  merchantId: nullableDimensionIdSchema,
  projectId: nullableDimensionIdSchema,
  note: z.string().max(2000)
});

export const createEntryRequestSchema = z.object({
  type: entryTypeSchema.default('Expense'),
  occurredAt: entryDateTimeSchema.optional(),
  originalAmount: moneyAmountSchema,
  originalCurrency: currencyCodeSchema.optional(),
  fxRate: fxRateSchema.optional(),
  categoryId: uuidSchema,
  memberId: uuidSchema,
  merchantId: nullableDimensionIdSchema.optional(),
  projectId: nullableDimensionIdSchema.optional(),
  note: z.string().trim().max(2000).default('')
});

export const updateEntryRequestSchema = z
  .object({
    type: entryTypeSchema.optional(),
    occurredAt: entryDateTimeSchema.optional(),
    originalAmount: moneyAmountSchema.optional(),
    originalCurrency: currencyCodeSchema.optional(),
    fxRate: fxRateSchema.optional(),
    categoryId: uuidSchema.optional(),
    memberId: uuidSchema.optional(),
    merchantId: nullableDimensionIdSchema.optional(),
    projectId: nullableDimensionIdSchema.optional(),
    note: z.string().trim().max(2000).optional()
  })
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one entry field to update.');

export const entryResponseSchema = z.object({
  entry: entrySchema
});

export const entryListResponseSchema = z.object({
  entries: z.array(entrySchema)
});

export const entrySortBySchema = z.enum(['occurredAt', 'baseAmount', 'createdAt', 'updatedAt']);
export const entrySortDirectionSchema = z.enum(['asc', 'desc']);

export const entryListQuerySchema = z.object({
  type: entryTypeSchema.optional(),
  categoryId: uuidSchema.optional(),
  memberId: uuidSchema.optional(),
  merchantId: uuidSchema.optional(),
  projectId: uuidSchema.optional(),
  occurredFrom: entryDateTimeSchema.optional(),
  occurredTo: entryDateTimeSchema.optional(),
  sortBy: entrySortBySchema.default('occurredAt'),
  sortDirection: entrySortDirectionSchema.default('desc')
});

export type Entry = z.infer<typeof entrySchema>;
export type EntryType = z.infer<typeof entryTypeSchema>;
export type CreateEntryRequest = z.infer<typeof createEntryRequestSchema>;
export type UpdateEntryRequest = z.infer<typeof updateEntryRequestSchema>;
export type EntryListQuery = z.infer<typeof entryListQuerySchema>;
export type EntrySortBy = z.infer<typeof entrySortBySchema>;
export type EntrySortDirection = z.infer<typeof entrySortDirectionSchema>;
