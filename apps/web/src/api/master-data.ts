import {
  categoryListResponseSchema,
  categoryResponseSchema,
  createCategoryRequestSchema,
  createLedgerRequestSchema,
  createMerchantRequestSchema,
  createNamedMasterDataRequestSchema,
  ledgerListResponseSchema,
  ledgerResponseSchema,
  memberResponseSchema,
  membersResponseSchema,
  merchantResponseSchema,
  merchantsResponseSchema,
  projectResponseSchema,
  projectsResponseSchema,
  type CreateLedgerRequest
} from '@qdd/shared';

import { jsonRequest } from './client';

export async function listLedgers() {
  return jsonRequest('/ledgers', ledgerListResponseSchema);
}

export async function createLedger(input: CreateLedgerRequest, csrfToken: string) {
  return jsonRequest('/ledgers', ledgerResponseSchema, {
    method: 'POST',
    csrfToken,
    body: createLedgerRequestSchema.parse(input)
  });
}

export async function listCategories(ledgerId: string) {
  return jsonRequest(`/ledgers/${ledgerId}/categories`, categoryListResponseSchema);
}

export async function createCategory(
  ledgerId: string,
  input: { stableKey: string; name: string; sortOrder?: number },
  csrfToken: string
) {
  return jsonRequest(`/ledgers/${ledgerId}/categories`, categoryResponseSchema, {
    method: 'POST',
    csrfToken,
    body: createCategoryRequestSchema.parse(input)
  });
}

export async function listMembers(ledgerId: string) {
  return jsonRequest(`/ledgers/${ledgerId}/members`, membersResponseSchema);
}

export async function createMember(
  ledgerId: string,
  input: { name: string; sortOrder?: number; status?: 'active' | 'inactive' },
  csrfToken: string
) {
  return jsonRequest(`/ledgers/${ledgerId}/members`, memberResponseSchema, {
    method: 'POST',
    csrfToken,
    body: createNamedMasterDataRequestSchema.parse(input)
  });
}

export async function listMerchants(ledgerId: string) {
  return jsonRequest(`/ledgers/${ledgerId}/merchants`, merchantsResponseSchema);
}

export async function createMerchant(
  ledgerId: string,
  input: { name: string; status?: 'active' | 'inactive' },
  csrfToken: string
) {
  return jsonRequest(`/ledgers/${ledgerId}/merchants`, merchantResponseSchema, {
    method: 'POST',
    csrfToken,
    body: createMerchantRequestSchema.parse(input)
  });
}

export async function listProjects(ledgerId: string) {
  return jsonRequest(`/ledgers/${ledgerId}/projects`, projectsResponseSchema);
}

export async function createProject(
  ledgerId: string,
  input: { name: string; sortOrder?: number; status?: 'active' | 'inactive' },
  csrfToken: string
) {
  return jsonRequest(`/ledgers/${ledgerId}/projects`, projectResponseSchema, {
    method: 'POST',
    csrfToken,
    body: createNamedMasterDataRequestSchema.parse(input)
  });
}
