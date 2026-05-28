import { type PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

import { ApiError } from './api-error';

export class ZodValidationPipe<TInput, TOutput> implements PipeTransform<TInput, TOutput> {
  constructor(private readonly schema: ZodType<TOutput, TInput>) {}

  transform(value: TInput): TOutput {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      throw new ApiError('VALIDATION_FAILED', 'Request validation failed.', 400, {
        issues: parsed.error.issues
      });
    }

    return parsed.data;
  }
}
