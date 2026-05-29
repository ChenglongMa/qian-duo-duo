export const MONEY_DECIMAL_PLACES = 4;
export const MONEY_MAX_INTEGER_DIGITS = 14;
export const FX_RATE_DECIMAL_PLACES = 8;
export const FX_RATE_MAX_INTEGER_DIGITS = 10;

export type FixedDecimalParseOptions = {
  readonly scale: number;
  readonly maxIntegerDigits: number;
  readonly label: string;
  readonly positive?: boolean;
};

export type FixedDecimalParseResult =
  | {
      readonly ok: true;
      readonly units: bigint;
      readonly normalized: string;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

const DECIMAL_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;

function pow10(exponent: number): bigint {
  return 10n ** BigInt(exponent);
}

export function formatScaledDecimal(units: bigint, scale: number): string {
  const negative = units < 0n;
  const absolute = negative ? -units : units;
  const divisor = pow10(scale);
  const integerPart = absolute / divisor;
  const fractionPart = absolute % divisor;
  const sign = negative ? '-' : '';

  if (scale === 0) {
    return `${sign}${integerPart.toString()}`;
  }

  return `${sign}${integerPart.toString()}.${fractionPart.toString().padStart(scale, '0')}`;
}

export function parseFixedDecimalString(
  value: string,
  options: FixedDecimalParseOptions
): FixedDecimalParseResult {
  const trimmed = value.trim();
  if (!DECIMAL_PATTERN.test(trimmed)) {
    return {
      ok: false,
      message: `${options.label} must be a plain decimal number without signs, separators, or exponents.`
    };
  }

  const [integerPart = '', fractionPart = ''] = trimmed.split('.');
  if (integerPart.length > options.maxIntegerDigits) {
    return {
      ok: false,
      message: `${options.label} exceeds the supported precision.`
    };
  }

  if (fractionPart.length > options.scale) {
    return {
      ok: false,
      message: `${options.label} supports at most ${options.scale} decimal places.`
    };
  }

  const paddedFraction = fractionPart.padEnd(options.scale, '0');
  const units = BigInt(`${integerPart}${paddedFraction}`);

  if (options.positive !== false && units <= 0n) {
    return {
      ok: false,
      message: `${options.label} must be greater than zero.`
    };
  }

  return {
    ok: true,
    units,
    normalized: formatScaledDecimal(units, options.scale)
  };
}

export function roundScaledInteger(value: bigint, currentScale: number, targetScale: number): bigint {
  if (currentScale === targetScale) {
    return value;
  }

  if (currentScale < targetScale) {
    return value * pow10(targetScale - currentScale);
  }

  const divisor = pow10(currentScale - targetScale);
  const quotient = value / divisor;
  const remainder = value % divisor;
  const absoluteRemainder = remainder < 0n ? -remainder : remainder;
  const increment = absoluteRemainder * 2n >= divisor ? (value < 0n ? -1n : 1n) : 0n;

  return quotient + increment;
}

export function multiplyFixedDecimalStrings(
  left: string,
  leftOptions: FixedDecimalParseOptions,
  right: string,
  rightOptions: FixedDecimalParseOptions,
  outputOptions: FixedDecimalParseOptions
): FixedDecimalParseResult {
  const leftParsed = parseFixedDecimalString(left, leftOptions);
  if (!leftParsed.ok) {
    return leftParsed;
  }

  const rightParsed = parseFixedDecimalString(right, rightOptions);
  if (!rightParsed.ok) {
    return rightParsed;
  }

  const product = leftParsed.units * rightParsed.units;
  const productScale = leftOptions.scale + rightOptions.scale;
  const roundedUnits = roundScaledInteger(product, productScale, outputOptions.scale);
  const normalized = formatScaledDecimal(roundedUnits, outputOptions.scale);
  const verified = parseFixedDecimalString(normalized, {
    ...outputOptions,
    positive: false
  });

  if (!verified.ok) {
    return verified;
  }

  return {
    ok: true,
    units: roundedUnits,
    normalized
  };
}

export function normalizeMoneyAmount(value: string): FixedDecimalParseResult {
  return parseFixedDecimalString(value, {
    scale: MONEY_DECIMAL_PLACES,
    maxIntegerDigits: MONEY_MAX_INTEGER_DIGITS,
    label: 'Amount'
  });
}

export function normalizeFxRate(value: string): FixedDecimalParseResult {
  return parseFixedDecimalString(value, {
    scale: FX_RATE_DECIMAL_PLACES,
    maxIntegerDigits: FX_RATE_MAX_INTEGER_DIGITS,
    label: 'FX rate'
  });
}

export function calculateMoneyProduct(amount: string, fxRate: string): FixedDecimalParseResult {
  return multiplyFixedDecimalStrings(
    amount,
    {
      scale: MONEY_DECIMAL_PLACES,
      maxIntegerDigits: MONEY_MAX_INTEGER_DIGITS,
      label: 'Amount'
    },
    fxRate,
    {
      scale: FX_RATE_DECIMAL_PLACES,
      maxIntegerDigits: FX_RATE_MAX_INTEGER_DIGITS,
      label: 'FX rate'
    },
    {
      scale: MONEY_DECIMAL_PLACES,
      maxIntegerDigits: MONEY_MAX_INTEGER_DIGITS,
      label: 'Base amount',
      positive: false
    }
  );
}
