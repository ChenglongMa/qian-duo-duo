import {
  createEntryRequestSchema,
  entryListQuerySchema,
  entryListResponseSchema,
  entryResponseSchema,
  updateEntryRequestSchema,
  type CreateEntryRequest,
  type EntryListQuery,
  type UpdateEntryRequest
} from '@qdd/shared';

import { jsonRequest } from './client';

const noContentSchema = {
  parse: () => ({ ok: true as const })
};

function queryToStrings(query: EntryListQuery): Record<string, string | undefined> {
  return {
    type: query.type,
    categoryId: query.categoryId,
    memberId: query.memberId,
    merchantId: query.merchantId,
    projectId: query.projectId,
    occurredFrom: query.occurredFrom,
    occurredTo: query.occurredTo,
    sortBy: query.sortBy,
    sortDirection: query.sortDirection
  };
}

export async function listEntries(ledgerId: string, query: Partial<EntryListQuery> = {}) {
  const parsedQuery = entryListQuerySchema.parse(query);
  return jsonRequest(`/ledgers/${ledgerId}/entries`, entryListResponseSchema, {
    query: queryToStrings(parsedQuery)
  });
}

export async function createEntry(ledgerId: string, input: CreateEntryRequest, csrfToken: string) {
  return jsonRequest(`/ledgers/${ledgerId}/entries`, entryResponseSchema, {
    method: 'POST',
    csrfToken,
    body: createEntryRequestSchema.parse(input)
  });
}

export async function updateEntry(
  ledgerId: string,
  entryId: string,
  input: UpdateEntryRequest,
  csrfToken: string
) {
  return jsonRequest(`/ledgers/${ledgerId}/entries/${entryId}`, entryResponseSchema, {
    method: 'PATCH',
    csrfToken,
    body: updateEntryRequestSchema.parse(input)
  });
}

export async function cloneEntry(ledgerId: string, entryId: string, csrfToken: string) {
  return jsonRequest(`/ledgers/${ledgerId}/entries/${entryId}/clone`, entryResponseSchema, {
    method: 'POST',
    csrfToken
  });
}

export async function deleteEntry(ledgerId: string, entryId: string, csrfToken: string) {
  return jsonRequest(`/ledgers/${ledgerId}/entries/${entryId}`, noContentSchema, {
    method: 'DELETE',
    csrfToken
  });
}
