import { HttpStatus } from '@nestjs/common';

export type ErrorDetails = Record<string, unknown>;

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly statusCode: number = HttpStatus.BAD_REQUEST,
    readonly details: ErrorDetails = {}
  ) {
    super(message);
  }
}

export function notFound(code: string, message: string, details: ErrorDetails = {}): ApiError {
  return new ApiError(code, message, HttpStatus.NOT_FOUND, details);
}
