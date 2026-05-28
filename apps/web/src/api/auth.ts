import {
  currentSessionResponseSchema,
  loginRequestSchema,
  loginResponseSchema,
  logoutResponseSchema,
  type CurrentSessionResponse,
  type LoginRequest,
  type LoginResponse,
  type LogoutResponse
} from '@qdd/shared';

const defaultApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

async function parseJsonResponse<T>(response: Response, parse: (value: unknown) => T): Promise<T> {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return parse(payload);
}

export async function login(input: LoginRequest, baseUrl = defaultApiBaseUrl): Promise<LoginResponse> {
  const body = loginRequestSchema.parse(input);
  const response = await fetch(`${withoutTrailingSlash(baseUrl)}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  return parseJsonResponse(response, (payload) => loginResponseSchema.parse(payload));
}

export async function fetchCurrentSession(baseUrl = defaultApiBaseUrl): Promise<CurrentSessionResponse> {
  const response = await fetch(`${withoutTrailingSlash(baseUrl)}/auth/session`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json'
    }
  });

  return parseJsonResponse(response, (payload) => currentSessionResponseSchema.parse(payload));
}

export async function logout(csrfToken: string, baseUrl = defaultApiBaseUrl): Promise<LogoutResponse> {
  const response = await fetch(`${withoutTrailingSlash(baseUrl)}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'x-csrf-token': csrfToken
    }
  });

  return parseJsonResponse(response, (payload) => logoutResponseSchema.parse(payload));
}
