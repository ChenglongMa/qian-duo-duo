import type {
  ArgumentsHost} from '@nestjs/common';
import {
  Catch,
  HttpException,
  HttpStatus,
  type ExceptionFilter
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ZodError } from 'zod';

import { ApiError } from './api-error';
import { getRequestId } from './request-context';

type HttpExceptionResponse = {
  message?: unknown;
  error?: unknown;
};

function toDetails(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const requestId = getRequestId(request);

    if (exception instanceof ApiError) {
      response.status(exception.statusCode).json({
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.details,
          requestId
        }
      });
      return;
    }

    if (exception instanceof ZodError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Request validation failed.',
          details: { issues: exception.issues },
          requestId
        }
      });
      return;
    }

    if (exception instanceof HttpException) {
      const body = exception.getResponse() as HttpExceptionResponse | string;
      const message =
        typeof body === 'object' && typeof body.message === 'string'
          ? body.message
          : exception.message;

      response.status(exception.getStatus()).json({
        error: {
          code: typeof body === 'object' && typeof body.error === 'string' ? body.error : 'HTTP_ERROR',
          message,
          details: typeof body === 'object' ? toDetails(body) : {},
          requestId
        }
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected server error occurred.',
        details: {},
        requestId
      }
    });
  }
}
