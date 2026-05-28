import { Body, Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  currentSessionResponseSchema,
  loginRequestSchema,
  loginResponseSchema,
  logoutResponseSchema,
  type LoginRequest
} from '@qdd/shared';

import { getRequestId, type QddRequest } from '../common/request-context';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { clearSessionCookie, setSessionCookie } from './auth-cookies';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

function getClientIp(request: Request): string {
  const forwardedFor = request.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0]?.trim() ?? request.ip ?? 'unknown';
  }

  return request.ip ?? 'unknown';
}

function getUserAgent(request: Request): string | null {
  const userAgent = request.headers['user-agent'];
  return typeof userAgent === 'string' ? userAgent : null;
}

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginRequestSchema)) body: LoginRequest,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    const result = await this.authService.login(body, {
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
      requestId: getRequestId(request)
    });

    setSessionCookie(response, result.sessionToken);
    return loginResponseSchema.parse({
      authenticated: result.authenticated,
      admin: result.admin,
      csrfToken: result.csrfToken
    });
  }

  @Public()
  @Get('session')
  async session(@Req() request: Request): Promise<unknown> {
    return currentSessionResponseSchema.parse(await this.authService.currentSession(request.headers.cookie));
  }

  @Post('logout')
  async logout(
    @Req() request: QddRequest,
    @Res({ passthrough: true }) response: Response
  ): Promise<unknown> {
    if (request.auth) {
      await this.authService.logout(request.auth.sessionId);
    }

    clearSessionCookie(response);
    return logoutResponseSchema.parse({ ok: true });
  }
}
