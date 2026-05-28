import { z } from 'zod';

import { uuidSchema } from './common';

export const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(64)
  .regex(/^[a-zA-Z0-9._-]+$/, 'Use letters, numbers, dots, underscores, or hyphens.');

export const loginRequestSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1).max(512)
});

export const authenticatedSessionSchema = z.object({
  authenticated: z.literal(true),
  admin: z.object({
    id: uuidSchema,
    username: usernameSchema
  }),
  csrfToken: z.string().min(32)
});

export const anonymousSessionSchema = z.object({
  authenticated: z.literal(false)
});

export const currentSessionResponseSchema = z.discriminatedUnion('authenticated', [
  authenticatedSessionSchema,
  anonymousSessionSchema
]);

export const loginResponseSchema = authenticatedSessionSchema;

export const logoutResponseSchema = z.object({
  ok: z.literal(true)
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type AuthenticatedSession = z.infer<typeof authenticatedSessionSchema>;
export type CurrentSessionResponse = z.infer<typeof currentSessionResponseSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
