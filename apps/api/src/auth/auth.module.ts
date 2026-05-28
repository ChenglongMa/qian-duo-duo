import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuditModule } from '../audit/audit.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { CsrfGuard } from './csrf.guard';
import { LoginRateLimiterService } from './login-rate-limiter.service';
import { PasswordHasherService } from './password-hasher.service';

@Module({
  imports: [AuditModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordHasherService,
    LoginRateLimiterService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard
    }
  ],
  exports: [AuthService, PasswordHasherService, LoginRateLimiterService]
})
export class AuthModule {}
