import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, Req } from '@nestjs/common';
import {
  createLedgerRequestSchema,
  ledgerListResponseSchema,
  ledgerResponseSchema,
  ledgerRouteParamsSchema,
  updateLedgerRequestSchema,
  type CreateLedgerRequest,
  type UpdateLedgerRequest
} from '@qdd/shared';

import type { QddRequest } from '../common/request-context';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { MasterDataService } from './master-data.service';

@Controller('ledgers')
export class LedgersController {
  constructor(@Inject(MasterDataService) private readonly masterData: MasterDataService) {}

  @Get()
  async list(): Promise<unknown> {
    return ledgerListResponseSchema.parse(await this.masterData.listLedgers());
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createLedgerRequestSchema)) body: CreateLedgerRequest,
    @Req() request: QddRequest
  ): Promise<unknown> {
    return ledgerResponseSchema.parse(await this.masterData.createLedger(body, request));
  }

  @Get(':ledgerId')
  async get(@Param(new ZodValidationPipe(ledgerRouteParamsSchema)) params: { ledgerId: string }): Promise<unknown> {
    return ledgerResponseSchema.parse(await this.masterData.getLedger(params.ledgerId));
  }

  @Patch(':ledgerId')
  async update(
    @Param(new ZodValidationPipe(ledgerRouteParamsSchema)) params: { ledgerId: string },
    @Body(new ZodValidationPipe(updateLedgerRequestSchema)) body: UpdateLedgerRequest,
    @Req() request: QddRequest
  ): Promise<unknown> {
    return ledgerResponseSchema.parse(await this.masterData.updateLedger(params.ledgerId, body, request));
  }

  @Delete(':ledgerId')
  @HttpCode(204)
  async delete(
    @Param(new ZodValidationPipe(ledgerRouteParamsSchema)) params: { ledgerId: string },
    @Req() request: QddRequest
  ): Promise<void> {
    await this.masterData.deleteLedger(params.ledgerId, request);
  }
}
