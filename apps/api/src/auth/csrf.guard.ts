import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { ApiError } from '../common/api-error';
import type { QddRequest } from '../common/request-context';
import { IS_PUBLIC_ROUTE } from './public.decorator';
import { secretHashMatches } from './secret';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass()
    ]);
    const request = context.switchToHttp().getRequest<Request>() as QddRequest;

    if (isPublic || SAFE_METHODS.has(request.method)) {
      return true;
    }

    const csrfToken = request.headers['x-csrf-token'];
    if (!request.auth || typeof csrfToken !== 'string') {
      throw new ApiError('CSRF_TOKEN_INVALID', 'A valid CSRF token is required.', 403);
    }

    if (!secretHashMatches(csrfToken, request.auth.csrfTokenHash)) {
      throw new ApiError('CSRF_TOKEN_INVALID', 'A valid CSRF token is required.', 403);
    }

    return true;
  }
}
