import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { CategoriesController } from './categories.controller';
import { CategoryYamlService } from './category-yaml.service';
import { LedgersController } from './ledgers.controller';
import { MasterDataService } from './master-data.service';
import { MembersController, MerchantsController, ProjectsController } from './named-master-data.controller';

@Module({
  imports: [AuditModule],
  controllers: [
    LedgersController,
    CategoriesController,
    MembersController,
    ProjectsController,
    MerchantsController
  ],
  providers: [MasterDataService, CategoryYamlService],
  exports: [MasterDataService, CategoryYamlService]
})
export class MasterDataModule {}
