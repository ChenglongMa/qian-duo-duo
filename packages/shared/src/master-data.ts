import { z } from 'zod';

import {
  currencyCodeSchema,
  isoDateTimeStringSchema,
  nonEmptyNameSchema,
  stableKeySchema,
  syncMetadataSchema,
  timezoneSchema,
  uuidSchema
} from './common';

export const entityStatusSchema = z.enum(['active', 'inactive']);

export const ledgerSchema = syncMetadataSchema.extend({
  name: nonEmptyNameSchema,
  baseCurrency: currencyCodeSchema,
  timezone: timezoneSchema
});

export const createLedgerRequestSchema = z.object({
  name: nonEmptyNameSchema,
  baseCurrency: currencyCodeSchema,
  timezone: timezoneSchema.default('UTC')
});

export const updateLedgerRequestSchema = createLedgerRequestSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Provide at least one ledger field to update.'
);

export const ledgerListResponseSchema = z.object({
  ledgers: z.array(ledgerSchema)
});

export const ledgerResponseSchema = z.object({
  ledger: ledgerSchema
});

export const ledgerRouteParamsSchema = z.object({
  ledgerId: uuidSchema
});

export const recordRouteParamsSchema = z.object({
  ledgerId: uuidSchema,
  id: uuidSchema
});

export const categorySchema = syncMetadataSchema.extend({
  ledgerId: uuidSchema,
  stableKey: stableKeySchema,
  parentId: uuidSchema.nullable(),
  name: nonEmptyNameSchema,
  sortOrder: z.number().int().min(0),
  status: entityStatusSchema
});

export type Category = z.infer<typeof categorySchema>;

export type CategoryTreeNode = Category & {
  children: CategoryTreeNode[];
};

export const categoryTreeNodeSchema: z.ZodType<CategoryTreeNode> = categorySchema.extend({
  children: z.lazy(() => z.array(categoryTreeNodeSchema))
});

export const categoryListResponseSchema = z.object({
  categories: z.array(categorySchema),
  tree: z.array(categoryTreeNodeSchema)
});

export const categoryResponseSchema = z.object({
  category: categorySchema
});

export const createCategoryRequestSchema = z.object({
  stableKey: stableKeySchema,
  parentId: uuidSchema.nullable().optional(),
  name: nonEmptyNameSchema,
  sortOrder: z.number().int().min(0).default(0),
  status: entityStatusSchema.default('active')
});

export const updateCategoryRequestSchema = z
  .object({
    parentId: uuidSchema.nullable().optional(),
    name: nonEmptyNameSchema.optional(),
    sortOrder: z.number().int().min(0).optional(),
    status: entityStatusSchema.optional()
  })
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one category field to update.');

export type CategoryYamlNode = {
  key: string;
  name: string;
  status?: 'active' | 'inactive' | undefined;
  children?: CategoryYamlNode[] | undefined;
};

export const categoryYamlNodeSchema: z.ZodType<CategoryYamlNode> = z.object({
  key: stableKeySchema,
  name: nonEmptyNameSchema,
  status: entityStatusSchema.optional(),
  children: z.lazy(() => z.array(categoryYamlNodeSchema)).optional()
});

export const categoryYamlDocumentSchema = z.object({
  version: z.literal(1),
  categories: z.array(categoryYamlNodeSchema).min(1)
});

export const categoryYamlRequestSchema = z.object({
  yaml: z.string().min(1).max(200_000)
});

export const categoryYamlIssueSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  path: z.array(z.union([z.string(), z.number()])).default([])
});

export const categoryYamlValidateResponseSchema = z.object({
  valid: z.boolean(),
  errors: z.array(categoryYamlIssueSchema)
});

export const categoryYamlImportResponseSchema = z.object({
  imported: z.number().int().min(0),
  versionNumber: z.number().int().positive(),
  categories: z.array(categorySchema)
});

export const categoryYamlExportResponseSchema = z.object({
  yaml: z.string(),
  versionNumber: z.number().int().positive().nullable()
});

export const categoryRollbackRequestSchema = z.object({
  versionNumber: z.number().int().positive(),
  confirmation: z.literal('ROLLBACK CATEGORIES')
});

export const categoryRollbackResponseSchema = z.object({
  restoredVersionNumber: z.number().int().positive(),
  newVersionNumber: z.number().int().positive(),
  categories: z.array(categorySchema)
});

export const copyCategoriesRequestSchema = z.object({
  sourceLedgerId: uuidSchema,
  confirmation: z.literal('COPY CATEGORIES')
});

export const namedMasterDataSchema = syncMetadataSchema.extend({
  ledgerId: uuidSchema,
  name: nonEmptyNameSchema,
  sortOrder: z.number().int().min(0),
  status: entityStatusSchema
});

export const createNamedMasterDataRequestSchema = z.object({
  name: nonEmptyNameSchema,
  sortOrder: z.number().int().min(0).default(0),
  status: entityStatusSchema.default('active')
});

export const updateNamedMasterDataRequestSchema = createNamedMasterDataRequestSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update.');

export const merchantSchema = syncMetadataSchema.extend({
  ledgerId: uuidSchema,
  name: nonEmptyNameSchema,
  normalizedName: z.string().min(1),
  status: entityStatusSchema
});

export const createMerchantRequestSchema = z.object({
  name: nonEmptyNameSchema,
  status: entityStatusSchema.default('active')
});

export const updateMerchantRequestSchema = createMerchantRequestSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one merchant field to update.');

export const memberSchema = namedMasterDataSchema;
export const projectSchema = namedMasterDataSchema;

export const membersResponseSchema = z.object({
  members: z.array(memberSchema)
});

export const memberResponseSchema = z.object({
  member: memberSchema
});

export const projectsResponseSchema = z.object({
  projects: z.array(projectSchema)
});

export const projectResponseSchema = z.object({
  project: projectSchema
});

export const merchantsResponseSchema = z.object({
  merchants: z.array(merchantSchema)
});

export const merchantResponseSchema = z.object({
  merchant: merchantSchema
});

export const auditLogSchema = z.object({
  id: uuidSchema,
  actorId: uuidSchema.nullable(),
  actorLabel: z.string().min(1),
  action: z.string().min(1),
  entityType: z.string().min(1),
  entityId: z.string().nullable(),
  ledgerId: uuidSchema.nullable(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: isoDateTimeStringSchema,
  requestId: z.string().min(1)
});

export type Ledger = z.infer<typeof ledgerSchema>;
export type EntityStatus = z.infer<typeof entityStatusSchema>;
export type CreateLedgerRequest = z.infer<typeof createLedgerRequestSchema>;
export type UpdateLedgerRequest = z.infer<typeof updateLedgerRequestSchema>;
export type CategoryYamlDocument = z.infer<typeof categoryYamlDocumentSchema>;
export type CategoryYamlIssue = z.infer<typeof categoryYamlIssueSchema>;
export type NamedMasterData = z.infer<typeof namedMasterDataSchema>;
export type Merchant = z.infer<typeof merchantSchema>;
