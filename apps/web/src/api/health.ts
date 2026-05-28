import { healthResponseSchema, type HealthResponse } from '@qdd/shared';

const defaultApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export async function fetchHealth(baseUrl = defaultApiBaseUrl): Promise<HealthResponse> {
  const response = await fetch(`${withoutTrailingSlash(baseUrl)}/health`, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Health request failed with status ${response.status}`);
  }

  return healthResponseSchema.parse(await response.json());
}
