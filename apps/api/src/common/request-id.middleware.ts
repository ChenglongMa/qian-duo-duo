import { randomUUID } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';

import type { QddRequest } from './request-context';

export function requestIdMiddleware(request: Request, response: Response, next: NextFunction): void {
  const incomingRequestId = request.headers['x-request-id'];
  const requestId =
    typeof incomingRequestId === 'string' && incomingRequestId.trim().length > 0
      ? incomingRequestId.trim()
      : randomUUID();

  (request as QddRequest).requestId = requestId;
  response.setHeader('x-request-id', requestId);
  next();
}
