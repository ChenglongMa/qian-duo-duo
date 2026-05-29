import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, Query, Req } from '@nestjs/common';
import {
  createEntryRequestSchema,
  entryListQuerySchema,
  entryListResponseSchema,
  entryResponseSchema,
  ledgerRouteParamsSchema,
  recordRouteParamsSchema,
  updateEntryRequestSchema,
  type CreateEntryRequest,
  type EntryListQuery,
  type UpdateEntryRequest
} from '@qdd/shared';

import type { QddRequest } from '../common/request-context';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { EntriesService } from './entries.service';

@Controller('ledgers/:ledgerId/entries')
export class EntriesController {
  constructor(@Inject(EntriesService) private readonly entries: EntriesService) {}

  @Get()
  async list(
    @Param(new ZodValidationPipe(ledgerRouteParamsSchema)) params: { ledgerId: string },
    @Query(new ZodValidationPipe(entryListQuerySchema)) query: EntryListQuery
  ): Promise<unknown> {
    return entryListResponseSchema.parse(await this.entries.listEntries(params.ledgerId, query));
  }

  @Post()
  async create(
    @Param(new ZodValidationPipe(ledgerRouteParamsSchema)) params: { ledgerId: string },
    @Body(new ZodValidationPipe(createEntryRequestSchema)) body: CreateEntryRequest,
    @Req() request: QddRequest
  ): Promise<unknown> {
    return entryResponseSchema.parse(await this.entries.createEntry(params.ledgerId, body, request));
  }

  @Get(':id')
  async get(
    @Param(new ZodValidationPipe(recordRouteParamsSchema)) params: { ledgerId: string; id: string }
  ): Promise<unknown> {
    return entryResponseSchema.parse(await this.entries.getEntry(params.ledgerId, params.id));
  }

  @Patch(':id')
  async update(
    @Param(new ZodValidationPipe(recordRouteParamsSchema)) params: { ledgerId: string; id: string },
    @Body(new ZodValidationPipe(updateEntryRequestSchema)) body: UpdateEntryRequest,
    @Req() request: QddRequest
  ): Promise<unknown> {
    return entryResponseSchema.parse(await this.entries.updateEntry(params.ledgerId, params.id, body, request));
  }

  @Post(':id/clone')
  async clone(
    @Param(new ZodValidationPipe(recordRouteParamsSchema)) params: { ledgerId: string; id: string },
    @Req() request: QddRequest
  ): Promise<unknown> {
    return entryResponseSchema.parse(await this.entries.cloneEntry(params.ledgerId, params.id, request));
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Param(new ZodValidationPipe(recordRouteParamsSchema)) params: { ledgerId: string; id: string },
    @Req() request: QddRequest
  ): Promise<void> {
    await this.entries.deleteEntry(params.ledgerId, params.id, request);
  }
}
