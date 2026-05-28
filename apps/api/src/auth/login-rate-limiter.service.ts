import { Injectable } from '@nestjs/common';

const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const FAILURE_THRESHOLD = 5;

type FailureState = {
  count: number;
  windowStartedAt: number;
  lockedUntil: number | null;
};

export type LoginRateLimitResult = {
  allowed: boolean;
  thresholdReached: boolean;
  retryAfterSeconds: number | null;
};

@Injectable()
export class LoginRateLimiterService {
  private readonly failures = new Map<string, FailureState>();

  check(ipAddress: string, username: string, now = Date.now()): LoginRateLimitResult {
    const state = this.failures.get(this.key(ipAddress, username));
    if (!state || now - state.windowStartedAt > WINDOW_MS) {
      return {
        allowed: true,
        thresholdReached: false,
        retryAfterSeconds: null
      };
    }

    if (state.lockedUntil && state.lockedUntil > now) {
      return {
        allowed: false,
        thresholdReached: true,
        retryAfterSeconds: Math.ceil((state.lockedUntil - now) / 1000)
      };
    }

    return {
      allowed: true,
      thresholdReached: false,
      retryAfterSeconds: null
    };
  }

  recordFailure(ipAddress: string, username: string, now = Date.now()): LoginRateLimitResult {
    const key = this.key(ipAddress, username);
    const existing = this.failures.get(key);
    const state =
      existing && now - existing.windowStartedAt <= WINDOW_MS
        ? existing
        : {
            count: 0,
            windowStartedAt: now,
            lockedUntil: null
          };

    state.count += 1;
    if (state.count >= FAILURE_THRESHOLD) {
      state.lockedUntil = now + LOCK_MS;
    }

    this.failures.set(key, state);

    return {
      allowed: state.lockedUntil === null,
      thresholdReached: state.count === FAILURE_THRESHOLD,
      retryAfterSeconds: state.lockedUntil ? Math.ceil((state.lockedUntil - now) / 1000) : null
    };
  }

  clear(ipAddress: string, username: string): void {
    this.failures.delete(this.key(ipAddress, username));
  }

  private key(ipAddress: string, username: string): string {
    return `${ipAddress.toLowerCase()}::${username.trim().toLowerCase()}`;
  }
}
