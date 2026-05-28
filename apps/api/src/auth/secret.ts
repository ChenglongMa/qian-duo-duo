import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const DEVELOPMENT_SESSION_SECRET = 'qdd-development-session-secret-change-me';

export function createOpaqueSecret(): string {
  return randomBytes(32).toString('base64url');
}

export function hashSecret(secret: string): string {
  return createHmac('sha256', resolveSessionSecret()).update(secret).digest('hex');
}

export function secretHashMatches(secret: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashSecret(secret), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function resolveSessionSecret(): string {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET is required in production.');
  }

  return DEVELOPMENT_SESSION_SECRET;
}
