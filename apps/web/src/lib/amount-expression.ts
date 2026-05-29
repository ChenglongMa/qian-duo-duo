import { formatScaledDecimal, normalizeMoneyAmount, roundScaledInteger } from '@qdd/shared';

type Rational = {
  readonly numerator: bigint;
  readonly denominator: bigint;
};

type Operator = '+' | '-' | '*' | '/';

type Token =
  | {
      readonly type: 'number';
      readonly value: Rational;
    }
  | {
      readonly type: 'operator';
      readonly value: Operator;
    };

export type AmountExpressionResult =
  | {
      readonly ok: true;
      readonly value: string;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

const ALLOWED_EXPRESSION_PATTERN = /^[0-9+\-*/.\s]*$/;

function decimalToRational(value: string): Rational | null {
  const [integerPart = '', fractionPart = ''] = value.split('.');
  if (integerPart.length === 0 && fractionPart.length === 0) {
    return null;
  }
  if (fractionPart.length > 8) {
    return null;
  }

  const paddedFraction = fractionPart;
  const denominator = 10n ** BigInt(paddedFraction.length);
  const numerator = BigInt(`${integerPart || '0'}${paddedFraction}`);

  return reduce({ numerator, denominator });
}

function reduce(value: Rational): Rational {
  const divisor = gcd(value.numerator < 0n ? -value.numerator : value.numerator, value.denominator);
  return {
    numerator: value.numerator / divisor,
    denominator: value.denominator / divisor
  };
}

function gcd(left: bigint, right: bigint): bigint {
  let a = left;
  let b = right;
  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }

  return a === 0n ? 1n : a;
}

function applyOperator(left: Rational, operator: Operator, right: Rational): Rational | null {
  switch (operator) {
    case '+':
      return reduce({
        numerator: left.numerator * right.denominator + right.numerator * left.denominator,
        denominator: left.denominator * right.denominator
      });
    case '-':
      return reduce({
        numerator: left.numerator * right.denominator - right.numerator * left.denominator,
        denominator: left.denominator * right.denominator
      });
    case '*':
      return reduce({
        numerator: left.numerator * right.numerator,
        denominator: left.denominator * right.denominator
      });
    case '/':
      if (right.numerator === 0n) {
        return null;
      }
      return reduce({
        numerator: left.numerator * right.denominator,
        denominator: left.denominator * right.numerator
      });
  }
}

function tokenize(expression: string): Token[] | null {
  const tokens: Token[] = [];
  let index = 0;
  let expectsNumber = true;

  while (index < expression.length) {
    const char = expression[index];
    if (char === undefined) {
      return null;
    }
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if ('+-*/'.includes(char)) {
      if (expectsNumber) {
        return null;
      }
      tokens.push({ type: 'operator', value: char as Operator });
      expectsNumber = true;
      index += 1;
      continue;
    }

    let numberText = '';
    while (index < expression.length) {
      const next = expression[index];
      if (next === undefined || !/[0-9.]/.test(next)) {
        break;
      }
      numberText += next;
      index += 1;
    }

    if (!expectsNumber || numberText.split('.').length > 2) {
      return null;
    }

    const value = decimalToRational(numberText);
    if (!value) {
      return null;
    }

    tokens.push({ type: 'number', value });
    expectsNumber = false;
  }

  return tokens.length > 0 && !expectsNumber ? tokens : null;
}

function collapse(tokens: Token[], operators: ReadonlySet<Operator>): Token[] | null {
  const output: Token[] = [];
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index];
    if (!token) {
      return null;
    }
    if (token.type !== 'number') {
      return null;
    }

    let value = token.value;
    let nextIndex = index + 1;
    while (nextIndex < tokens.length) {
      const operator = tokens[nextIndex];
      const right = tokens[nextIndex + 1];
      if (!operator || operator.type !== 'operator' || !right || right.type !== 'number') {
        return null;
      }
      if (!operators.has(operator.value)) {
        break;
      }

      const applied = applyOperator(value, operator.value, right.value);
      if (!applied) {
        return null;
      }
      value = applied;
      nextIndex += 2;
    }

    output.push({ type: 'number', value });
    if (nextIndex < tokens.length) {
      const operator = tokens[nextIndex];
      if (!operator || operator.type !== 'operator') {
        return null;
      }
      output.push(operator);
    }
    index = nextIndex + 1;
  }

  return output;
}

function rationalToMoney(value: Rational): AmountExpressionResult {
  const scaled = roundScaledInteger(value.numerator * 10000n, 0, 0) / value.denominator;
  const remainder = (value.numerator * 10000n) % value.denominator;
  const rounded = scaled + (remainder * 2n >= value.denominator ? 1n : 0n);
  const normalized = formatScaledDecimal(rounded, 4);
  const valid = normalizeMoneyAmount(normalized);

  if (!valid.ok) {
    return {
      ok: false,
      message: valid.message
    };
  }

  return {
    ok: true,
    value: valid.normalized
  };
}

export function evaluateAmountExpression(expression: string): AmountExpressionResult {
  const trimmed = expression.trim();
  if (trimmed.length === 0) {
    return {
      ok: false,
      message: 'Enter an amount.'
    };
  }

  if (!ALLOWED_EXPRESSION_PATTERN.test(trimmed)) {
    return {
      ok: false,
      message: 'Use digits, decimals, spaces, and + - * / only.'
    };
  }

  const tokens = tokenize(trimmed);
  if (!tokens) {
    return {
      ok: false,
      message: 'Enter a valid amount expression.'
    };
  }

  const multiplied = collapse(tokens, new Set<Operator>(['*', '/']));
  const summed = multiplied ? collapse(multiplied, new Set<Operator>(['+', '-'])) : null;
  if (!summed || summed.length !== 1 || summed[0]?.type !== 'number') {
    return {
      ok: false,
      message: 'Enter a valid amount expression.'
    };
  }

  return rationalToMoney(summed[0].value);
}

export function amountExpressionAllows(value: string): boolean {
  return ALLOWED_EXPRESSION_PATTERN.test(value);
}
