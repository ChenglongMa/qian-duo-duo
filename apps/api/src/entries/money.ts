import {
  calculateMoneyProduct,
  normalizeFxRate,
  normalizeMoneyAmount,
  type FixedDecimalParseResult
} from '@qdd/shared';

export function validateEntryAmount(value: string): FixedDecimalParseResult {
  return normalizeMoneyAmount(value);
}

export function validateFxRate(value: string): FixedDecimalParseResult {
  return normalizeFxRate(value);
}

export function calculateBaseAmount(originalAmount: string, fxRate: string): string {
  const result = calculateMoneyProduct(originalAmount, fxRate);
  if (!result.ok) {
    throw new Error(result.message);
  }

  return result.normalized;
}
