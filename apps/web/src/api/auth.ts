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

import { defaultApiBaseUrl, jsonRequest } from './client';

export async function login(input: LoginRequest, baseUrl = defaultApiBaseUrl): Promise<LoginResponse> {
  const body = loginRequestSchema.parse(input);
  return jsonRequest('/auth/login', loginResponseSchema, { method: 'POST', body, baseUrl });
}

export async function fetchCurrentSession(baseUrl = defaultApiBaseUrl): Promise<CurrentSessionResponse> {
  return jsonRequest('/auth/session', currentSessionResponseSchema, { baseUrl });
}

export async function logout(csrfToken: string, baseUrl = defaultApiBaseUrl): Promise<LogoutResponse> {
  return jsonRequest('/auth/logout', logoutResponseSchema, { method: 'POST', csrfToken, baseUrl });
}
