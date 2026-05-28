const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'qwerty123',
  'letmein',
  'adminadmin',
  'qian-duo-duo',
  'qianduoduo',
  'changeme',
  'welcome123'
]);

export type PasswordPolicyResult = {
  valid: boolean;
  errors: string[];
};

export function validatePasswordPolicy(password: string): PasswordPolicyResult {
  const errors: string[] = [];
  const normalized = password.trim().toLowerCase();

  if (password.length < 12) {
    errors.push('PASSWORD_TOO_SHORT');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('PASSWORD_REQUIRES_LOWERCASE');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('PASSWORD_REQUIRES_UPPERCASE');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('PASSWORD_REQUIRES_NUMBER');
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('PASSWORD_REQUIRES_SYMBOL');
  }

  if (COMMON_PASSWORDS.has(normalized)) {
    errors.push('PASSWORD_COMMON');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function assertPasswordPolicy(password: string): void {
  const result = validatePasswordPolicy(password);
  if (!result.valid) {
    throw new Error(`Admin password failed policy: ${result.errors.join(', ')}`);
  }
}
