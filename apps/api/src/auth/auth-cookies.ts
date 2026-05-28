import type { Response } from 'express';
import { parse, serialize } from 'cookie';

export const SESSION_COOKIE_NAME = 'qdd_session';

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export function readSessionCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) {
    return null;
  }

  return parse(cookieHeader)[SESSION_COOKIE_NAME] ?? null;
}

export function setSessionCookie(response: Response, sessionToken: string): void {
  response.setHeader(
    'set-cookie',
    serialize(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS
    })
  );
}

export function clearSessionCookie(response: Response): void {
  response.setHeader(
    'set-cookie',
    serialize(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    })
  );
}
