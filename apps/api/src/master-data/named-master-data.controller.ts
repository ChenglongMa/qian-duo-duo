import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, Req } from '@nestjs/common';
import {
  createMerchantRequestSchema,
  createNamedMasterDataRequestSchema,
  ledgerRouteParamsSchema,
  memberResponseSchema,
  membersResponseSchema,
  merchantResponseSchema,
  merchantsResponseSchema,
  projectResponseSchema,
  projectsResponseSchema,
  recordRouteParamsSchema,
  updateMerchantRequestSchema,
  updateNamedMasterDataRequestSchema
} from '@qdd/shared';

import type { QddRequest } from '../common/request-context';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { MasterDataService } from './master-data.service';

type NamedBody = {
  name: string;
  sortOrder: number;
  status: 'active' | 'inactive';
};

type NamedPatchBody = {
  name?: string;
  sortOrder?: number;
  status?: 'active' | 'inactive';
};

@Controller('ledgers/:ledgerId/members')
export class MembersController {
  constructor(@Inject(MasterDataService) private readonly masterData: MasterDataService) {}

  @Get()
  async list(@Param(new ZodValidationPipe(ledgerRouteParamsSchema)) params: { ledgerId: string }): Promise<unknown> {
    return membersResponseSchema.parse(await this.masterData.listMembers(params.ledgerId));
  }

  @Post()
  async create(
    @Param(new ZodValidationPipe(ledgerRouteParamsSchema)) params: { ledgerId: string },
    @Body(new ZodValidationPipe(createNamedMasterDataRequestSchema)) body: NamedBody,
    @Req() request: QddRequest
  ): Promise<unknown> {
    return memberResponseSchema.parse(await this.masterData.createMember(params.ledgerId, body, request));
  }

  @Patch(':id')
  async update(
    @Param(new ZodValidationPipe(recordRouteParamsSchema)) params: { ledgerId: string; id: string },
    @Body(new ZodValidationPipe(updateNamedMasterDataRequestSchema)) body: NamedPatchBody,
    @Req() request: QddRequest
  ): Promise<unknown> {
    return memberResponseSchema.parse(await this.masterData.updateMember(params.ledgerId, params.id, body, request));
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Param(new ZodValidationPipe(recordRouteParamsSchema)) params: { ledgerId: string; id: string },
    @Req() request: QddRequest
  ): Promise<void> {
    await this.masterData.deleteMember(params.ledgerId, params.id, request);
  }
}

@Controller('ledgers/:ledgerId/projects')
export class ProjectsController {
  constructor(@Inject(MasterDataService) private readonly masterData: MasterDataService) {}

  @Get()
  async list(@Param(new ZodValidationPipe(ledgerRouteParamsSchema)) params: { ledgerId: string }): Promise<unknown> {
    return projectsResponseSchema.parse(await this.masterData.listProjects(params.ledgerId));
  }

  @Post()
  async create(
    @Param(new ZodValidationPipe(ledgerRouteParamsSchema)) params: { ledgerId: string },
    @Body(new ZodValidationPipe(createNamedMasterDataRequestSchema)) body: NamedBody,
    @Req() request: QddRequest
  ): Promise<unknown> {
    return projectResponseSchema.parse(await this.masterData.createProject(params.ledgerId, body, request));
  }

  @Patch(':id')
  async update(
    @Param(new ZodValidationPipe(recordRouteParamsSchema)) params: { ledgerId: string; id: string },
    @Body(new ZodValidationPipe(updateNamedMasterDataRequestSchema)) body: NamedPatchBody,
    @Req() request: QddRequest
  ): Promise<unknown> {
    return projectResponseSchema.parse(await this.masterData.updateProject(params.ledgerId, params.id, body, request));
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Param(new ZodValidationPipe(recordRouteParamsSchema)) params: { ledgerId: string; id: string },
    @Req() request: QddRequest
  ): Promise<void> {
    await this.masterData.deleteProject(params.ledgerId, params.id, request);
  }
}

@Controller('ledgers/:ledgerId/merchants')
export class MerchantsController {
  constructor(@Inject(MasterDataService) private readonly masterData: MasterDataService) {}

  @Get()
  async list(@Param(new ZodValidationPipe(ledgerRouteParamsSchema)) params: { ledgerId: string }): Promise<unknown> {
    return merchantsResponseSchema.parse(await this.masterData.listMerchants(params.ledgerId));
  }

  @Post()
  async create(
    @Param(new ZodValidationPipe(ledgerRouteParamsSchema)) params: { ledgerId: string },
    @Body(new ZodValidationPipe(createMerchantRequestSchema)) body: { name: string; status: 'active' | 'inactive' },
    @Req() request: QddRequest
  ): Promise<unknown> {
    return merchantResponseSchema.parse(await this.masterData.createMerchant(params.ledgerId, body, request));
  }

  @Patch(':id')
  async update(
    @Param(new ZodValidationPipe(recordRouteParamsSchema)) params: { ledgerId: string; id: string },
    @Body(new ZodValidationPipe(updateMerchantRequestSchema)) body: { name?: string; status?: 'active' | 'inactive' },
    @Req() request: QddRequest
  ): Promise<unknown> {
    return merchantResponseSchema.parse(await this.masterData.updateMerchant(params.ledgerId, params.id, body, request));
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Param(new ZodValidationPipe(recordRouteParamsSchema)) params: { ledgerId: string; id: string },
    @Req() request: QddRequest
  ): Promise<void> {
    await this.masterData.deleteMerchant(params.ledgerId, params.id, request);
  }
}
