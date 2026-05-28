import type { Request } from 'express';

export type AuthenticatedRequestContext = {
  adminId: string;
  username: string;
  sessionId: string;
  csrfTokenHash: string;
};

export type QddRequest = Request & {
  requestId?: string;
  auth?: AuthenticatedRequestContext;
};

export function getRequestId(request: Request): string {
  const qddRequest = request as QddRequest;
  if (qddRequest.requestId) {
    return qddRequest.requestId;
  }

  const headerValue = request.headers['x-request-id'];
  if (typeof headerValue === 'string' && headerValue.length > 0) {
    return headerValue;
  }

  return 'unknown-request';
}

export function getActor(request: QddRequest): {
  actorId: string | null;
  actorLabel: string;
} {
  return request.auth
    ? {
        actorId: request.auth.adminId,
        actorLabel: request.auth.username
      }
    : {
        actorId: null,
        actorLabel: 'anonymous'
      };
}
