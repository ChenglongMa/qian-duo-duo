import { describe, expect, it } from 'vitest';

import { calculateBaseAmount, validateEntryAmount, validateFxRate } from './money';

describe('entry money helpers', () => {
  it('validates money amounts as plain decimal strings', () => {
    expect(validateEntryAmount('12.34')).toMatchObject({ ok: true, normalized: '12.3400' });
    expect(validateEntryAmount('1e2')).toMatchObject({ ok: false });
    expect(validateEntryAmount('10.12345')).toMatchObject({ ok: false });
    expect(validateEntryAmount('0')).toMatchObject({ ok: false });
  });

  it('validates FX rates as high precision decimal strings', () => {
    expect(validateFxRate('1')).toMatchObject({ ok: true, normalized: '1.00000000' });
    expect(validateFxRate('0.12345678')).toMatchObject({ ok: true, normalized: '0.12345678' });
    expect(validateFxRate('0.123456789')).toMatchObject({ ok: false });
    expect(validateFxRate('1e-3')).toMatchObject({ ok: false });
  });

  it('calculates persisted base amounts deterministically', () => {
    expect(calculateBaseAmount('10.0000', '1.50000000')).toBe('15.0000');
    expect(calculateBaseAmount('1.0000', '1.23456789')).toBe('1.2346');
    expect(calculateBaseAmount('2.5555', '3.33333333')).toBe('8.5183');
  });
});
