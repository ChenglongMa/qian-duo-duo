import { apiErrorBodySchema } from '@qdd/shared';

export const defaultApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

type JsonRequestOptions = {
  readonly method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  readonly body?: unknown;
  readonly csrfToken?: string;
  readonly query?: Record<string, string | undefined>;
  readonly baseUrl?: string;
};

type JsonSchema<T> = {
  parse(value: unknown): T;
};

function pathWithQuery(path: string, query: Record<string, string | undefined> | undefined): string {
  if (!query) {
    return path;
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(key, value);
    }
  }

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export async function jsonRequest<T>(
  path: string,
  schema: JsonSchema<T>,
  options: JsonRequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json'
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.csrfToken) {
    headers['x-csrf-token'] = options.csrfToken;
  }

  const requestInit: RequestInit = {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers
  };

  if (options.body !== undefined) {
    requestInit.body = JSON.stringify(options.body);
  }

  const response = await fetch(
    `${withoutTrailingSlash(options.baseUrl ?? defaultApiBaseUrl)}${pathWithQuery(path, options.query)}`,
    requestInit
  );

  if (response.status === 204) {
    return schema.parse({ ok: true });
  }

  const payload: unknown = await response.json();
  if (!response.ok) {
    const parsedError = apiErrorBodySchema.safeParse(payload);
    const message = parsedError.success
      ? parsedError.data.error.message
      : `API request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return schema.parse(payload);
}
