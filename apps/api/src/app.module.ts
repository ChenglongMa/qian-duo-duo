import { Module } from '@nestjs/common';

import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { EntriesModule } from './entries/entries.module';
import { HealthModule } from './health/health.module';
import { MasterDataModule } from './master-data/master-data.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuditModule, AuthModule, MasterDataModule, EntriesModule, HealthModule]
})
export class AppModule {}
