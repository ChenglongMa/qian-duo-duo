import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, Req } from '@nestjs/common';
import {
  categoryListResponseSchema,
  categoryResponseSchema,
  categoryRollbackRequestSchema,
  categoryRollbackResponseSchema,
  categoryYamlExportResponseSchema,
  categoryYamlImportResponseSchema,
  categoryYamlRequestSchema,
  categoryYamlValidateResponseSchema,
  copyCategoriesRequestSchema,
  createCategoryRequestSchema,
  ledgerRouteParamsSchema,
  recordRouteParamsSchema,
  updateCategoryRequestSchema
} from '@qdd/shared';

import type { QddRequest } from '../common/request-context';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { MasterDataService } from './master-data.service';

@Controller('ledgers/:ledgerId/categories')
export class CategoriesController {
  constructor(@Inject(MasterDataService) private readonly masterData: MasterDataService) {}

  @Get()
  async list(@Param(new ZodValidationPipe(ledgerRouteParamsSchema)) params: { ledgerId: string }): Promise<unknown> {
    return categoryListResponseSchema.parse(await this.masterData.listCategories(params.ledgerId));
  }

  @Post()
  async create(
    @Param(new ZodValidationPipe(ledgerRouteParamsSchema)) params: { ledgerId: string },
    @Body(new ZodValidationPipe(createCategoryRequestSchema)) body: {
      stableKey: string;
      parentId?: string | null;
      name: string;
      sortOrder: number;
      status: 'active' | 'inactive';
    },
    @Req() request: QddRequest
  ): Promise<unknown> {
    return categoryResponseSchema.parse(await this.masterData.createCategory(params.ledgerId, body, request));
  }

  @Patch(':id')
  async update(
    @Param(new ZodValidationPipe(recordRouteParamsSchema)) params: { ledgerId: string; id: string },
    @Body(new ZodValidationPipe(updateCategoryRequestSchema)) body: {
      parentId?: string | null;
      name?: string;
      sortOrder?: number;
      status?: 'active' | 'inactive';
    },
    @Req() request: QddRequest
  ): Promise<unknown> {
    return categoryResponseSchema.parse(
      await this.masterData.updateCategory(params.ledgerId, params.id, body, request)
    );
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Param(new ZodValidationPipe(recordRouteParamsSchema)) params: { ledgerId: string; id: string },
    @Req() request: QddRequest
  ): Promise<void> {
    await this.masterData.deleteCategory(params.ledgerId, params.id, request);
  }

  @Post('yaml/validate')
  async validateYaml(
    @Body(new ZodValidationPipe(categoryYamlRequestSchema)) body: { yaml: string }
  ): Promise<unknown> {
    return categoryYamlValidateResponseSchema.parse(this.masterData.validateCategoryYaml(body.yaml));
  }

  @Post('yaml/import')
  async importYaml(
    @Param(new ZodValidationPipe(ledgerRouteParamsSchema)) params: { ledgerId: string },
    @Body(new ZodValidationPipe(categoryYamlRequestSchema)) body: { yaml: string },
    @Req() request: QddRequest
  ): Promise<unknown> {
    return categoryYamlImportResponseSchema.parse(
      await this.masterData.importCategoryYaml(params.ledgerId, body.yaml, request)
    );
  }

  @Get('yaml/export')
  async exportYaml(
    @Param(new ZodValidationPipe(ledgerRouteParamsSchema)) params: { ledgerId: string },
    @Req() request: QddRequest
  ): Promise<unknown> {
    return categoryYamlExportResponseSchema.parse(await this.masterData.exportCategoryYaml(params.ledgerId, request));
  }

  @Post('rollback')
  async rollback(
    @Param(new ZodValidationPipe(ledgerRouteParamsSchema)) params: { ledgerId: string },
    @Body(new ZodValidationPipe(categoryRollbackRequestSchema)) body: {
      versionNumber: number;
      confirmation: 'ROLLBACK CATEGORIES';
    },
    @Req() request: QddRequest
  ): Promise<unknown> {
    return categoryRollbackResponseSchema.parse(
      await this.masterData.rollbackCategories(params.ledgerId, body.versionNumber, request)
    );
  }

  @Post('copy-from')
  async copyFrom(
    @Param(new ZodValidationPipe(ledgerRouteParamsSchema)) params: { ledgerId: string },
    @Body(new ZodValidationPipe(copyCategoriesRequestSchema)) body: {
      sourceLedgerId: string;
      confirmation: 'COPY CATEGORIES';
    },
    @Req() request: QddRequest
  ): Promise<unknown> {
    return categoryYamlImportResponseSchema.parse(
      await this.masterData.copyCategories(params.ledgerId, body.sourceLedgerId, request)
    );
  }
}
