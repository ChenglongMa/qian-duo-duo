import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuditService } from '../audit/audit.service';
import { ApiError } from '../common/api-error';
import type { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { LoginRateLimiterService } from './login-rate-limiter.service';
import type { PasswordHasherService } from './password-hasher.service';

describe('AuthService', () => {
  const admin = {
    id: '11111111-1111-4111-8111-111111111111',
    username: 'admin',
    passwordHash: 'hash'
  };

  let prisma: PrismaService;
  let hasher: PasswordHasherService;
  let audit: AuditService;
  let service: AuthService;

  beforeEach(() => {
    prisma = {
      adminAccount: {
        findUnique: vi.fn().mockResolvedValue(admin)
      },
      adminSession: {
        create: vi.fn().mockResolvedValue({ id: 'session-id' }),
        findUnique: vi.fn(),
        update: vi.fn()
      }
    } as unknown as PrismaService;
    hasher = {
      hash: vi.fn(),
      verify: vi.fn().mockResolvedValue(true)
    } as unknown as PasswordHasherService;
    audit = {
      record: vi.fn().mockResolvedValue(undefined)
    } as unknown as AuditService;
    service = new AuthService(prisma, hasher, new LoginRateLimiterService(), audit);
  });

  it('creates a hashed-token session and returns a csrf token on valid login', async () => {
    const result = await service.login(
      { username: 'admin', password: 'CorrectHorse!2026' },
      { ipAddress: '127.0.0.1', userAgent: 'vitest', requestId: 'request-id' }
    );

    expect(result.authenticated).toBe(true);
    expect(result.admin.username).toBe('admin');
    expect(result.csrfToken.length).toBeGreaterThan(32);
    expect(result.sessionToken.length).toBeGreaterThan(32);
    expect(prisma.adminSession.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        adminId: admin.id,
        userAgent: 'vitest',
        ipAddress: '127.0.0.1'
      })
    });
  });

  it('returns a generic login error and audits when the threshold is reached', async () => {
    vi.mocked(hasher.verify).mockResolvedValue(false);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(
        service.login(
          { username: 'admin', password: 'wrong' },
          { ipAddress: '127.0.0.1', userAgent: null, requestId: `request-${attempt}` }
        )
      ).rejects.toThrow(ApiError);
    }

    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'auth.login_failure_threshold',
        entityType: 'admin_account',
        entityId: admin.id
      })
    );
  });
});
