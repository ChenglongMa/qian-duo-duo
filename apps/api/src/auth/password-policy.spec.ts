import { describe, expect, it } from 'vitest';

import { validatePasswordPolicy } from './password-policy';

describe('validatePasswordPolicy', () => {
  it('accepts a strong admin password', () => {
    expect(validatePasswordPolicy('CorrectHorse!2026').valid).toBe(true);
  });

  it('rejects short and common passwords', () => {
    const result = validatePasswordPolicy('password');

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('PASSWORD_TOO_SHORT');
    expect(result.errors).toContain('PASSWORD_COMMON');
  });

  it('requires uppercase, lowercase, number, and symbol characters', () => {
    const result = validatePasswordPolicy('lowercaseonly');

    expect(result.errors).toEqual(
      expect.arrayContaining([
        'PASSWORD_REQUIRES_UPPERCASE',
        'PASSWORD_REQUIRES_NUMBER',
        'PASSWORD_REQUIRES_SYMBOL'
      ])
    );
  });
});
