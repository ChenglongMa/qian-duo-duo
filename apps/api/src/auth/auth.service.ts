import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { LoginRequest, LoginResponse, CurrentSessionResponse } from '@qdd/shared';

import { ApiError } from '../common/api-error';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { readSessionCookie } from './auth-cookies';
import { LoginRateLimiterService } from './login-rate-limiter.service';
import { PasswordHasherService } from './password-hasher.service';
import { createOpaqueSecret, hashSecret } from './secret';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const GENERIC_LOGIN_FAILURE = 'Invalid username or password.';

type LoginMetadata = {
  ipAddress: string;
  userAgent: string | null;
  requestId: string;
};

type SessionLookupResult = {
  adminId: string;
  username: string;
  sessionId: string;
  csrfTokenHash: string;
};

export type LoginResult = LoginResponse & {
  sessionToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(PasswordHasherService)
    private readonly passwordHasher: PasswordHasherService,
    @Inject(LoginRateLimiterService)
    private readonly limiter: LoginRateLimiterService,
    @Inject(AuditService)
    private readonly audit: AuditService
  ) {}

  async login(input: LoginRequest, metadata: LoginMetadata): Promise<LoginResult> {
    const username = input.username.trim();
    const limit = this.limiter.check(metadata.ipAddress, username);
    if (!limit.allowed) {
      throw new ApiError('LOGIN_RATE_LIMITED', 'Login is temporarily locked. Try again later.', HttpStatus.TOO_MANY_REQUESTS, {
        retryAfterSeconds: limit.retryAfterSeconds
      });
    }

    const admin = await this.prisma.adminAccount.findUnique({
      where: { username }
    });

    const passwordValid = admin
      ? await this.passwordHasher.verify(admin.passwordHash, input.password)
      : false;

    if (!admin || !passwordValid) {
      const failure = this.limiter.recordFailure(metadata.ipAddress, username);
      if (failure.thresholdReached) {
        await this.audit.record({
          actorId: null,
          actorLabel: 'anonymous',
          action: 'auth.login_failure_threshold',
          entityType: 'admin_account',
          entityId: admin?.id ?? null,
          metadata: { username, ipAddress: metadata.ipAddress },
          requestId: metadata.requestId
        });
      }

      throw new ApiError('INVALID_LOGIN', GENERIC_LOGIN_FAILURE, HttpStatus.UNAUTHORIZED);
    }

    this.limiter.clear(metadata.ipAddress, username);

    const sessionToken = createOpaqueSecret();
    const csrfToken = createOpaqueSecret();

    await this.prisma.adminSession.create({
      data: {
        adminId: admin.id,
        tokenHash: hashSecret(sessionToken),
        csrfTokenHash: hashSecret(csrfToken),
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS)
      }
    });

    return {
      authenticated: true,
      admin: {
        id: admin.id,
        username: admin.username
      },
      csrfToken,
      sessionToken
    };
  }

  async currentSession(cookieHeader: string | undefined): Promise<CurrentSessionResponse> {
    const sessionToken = readSessionCookie(cookieHeader);
    if (!sessionToken) {
      return { authenticated: false };
    }

    const session = await this.lookupSession(sessionToken);
    if (!session) {
      return { authenticated: false };
    }

    const csrfToken = createOpaqueSecret();
    await this.prisma.adminSession.update({
      where: { id: session.sessionId },
      data: { csrfTokenHash: hashSecret(csrfToken) }
    });

    return {
      authenticated: true,
      admin: {
        id: session.adminId,
        username: session.username
      },
      csrfToken
    };
  }

  async lookupSession(sessionToken: string): Promise<SessionLookupResult | null> {
    const session = await this.prisma.adminSession.findUnique({
      where: { tokenHash: hashSecret(sessionToken) },
      include: { admin: true }
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      return null;
    }

    return {
      adminId: session.adminId,
      username: session.admin.username,
      sessionId: session.id,
      csrfTokenHash: session.csrfTokenHash
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.prisma.adminSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    });
  }
}
