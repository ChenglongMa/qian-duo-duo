import { describe, expect, it } from 'vitest';

import { LoginRateLimiterService } from './login-rate-limiter.service';

describe('LoginRateLimiterService', () => {
  it('locks an IP/account pair after repeated failures', () => {
    const limiter = new LoginRateLimiterService();
    const now = new Date('2026-05-29T00:00:00.000Z').getTime();

    for (let index = 0; index < 4; index += 1) {
      expect(limiter.recordFailure('127.0.0.1', 'admin', now + index).thresholdReached).toBe(false);
    }

    const fifth = limiter.recordFailure('127.0.0.1', 'admin', now + 5);
    expect(fifth.thresholdReached).toBe(true);
    expect(limiter.check('127.0.0.1', 'admin', now + 6).allowed).toBe(false);
  });

  it('clears failures after successful login', () => {
    const limiter = new LoginRateLimiterService();

    limiter.recordFailure('127.0.0.1', 'admin');
    limiter.clear('127.0.0.1', 'admin');

    expect(limiter.check('127.0.0.1', 'admin').allowed).toBe(true);
  });
});
