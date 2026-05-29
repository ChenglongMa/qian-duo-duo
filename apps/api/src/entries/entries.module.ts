import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { EntriesController } from './entries.controller';
import { EntriesService } from './entries.service';

@Module({
  imports: [AuditModule],
  controllers: [EntriesController],
  providers: [EntriesService],
  exports: [EntriesService]
})
export class EntriesModule {}
