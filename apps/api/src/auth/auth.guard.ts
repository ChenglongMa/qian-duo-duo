import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { ApiError } from '../common/api-error';
import type { QddRequest } from '../common/request-context';
import { readSessionCookie } from './auth-cookies';
import { AuthService } from './auth.service';
import { IS_PUBLIC_ROUTE } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector)
    private readonly reflector: Reflector,
    @Inject(AuthService)
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>() as QddRequest;
    const sessionToken = readSessionCookie(request.headers.cookie);
    if (!sessionToken) {
      throw new ApiError('AUTH_REQUIRED', 'Authentication is required.', 401);
    }

    const session = await this.authService.lookupSession(sessionToken);
    if (!session) {
      throw new ApiError('AUTH_REQUIRED', 'Authentication is required.', 401);
    }

    request.auth = session;
    return true;
  }
}
