// src/core/finance_numeric.js
// AXIUM ZERO Phase 0 finance numeric primitives.
// Money is represented as integer micro-dollars (1 USD = 1,000,000 micros).
// No JavaScript float is accepted as a money input.

export const MICRO_DOLLARS_PER_USD = 1_000_000n;
export const BPS_DENOMINATOR = 10_000n;

export function assertMoneyInputIsNotNumber(value, label = 'money') {
  if (typeof value === 'number') {
    throw new TypeError(`${label} must not be a JavaScript number; use a decimal string or BigInt micro-dollar value`);
  }
}

export function micros(value, label = 'money') {
  assertMoneyInputIsNotNumber(value, label);

  if (typeof value === 'bigint') return value;

  if (typeof value !== 'string') {
    throw new TypeError(`${label} must be a decimal string or BigInt`);
  }

  const trimmed = value.trim();
  if (!/^-?\d+(\.\d{0,6})?$/.test(trimmed)) {
    throw new Error(`${label} must be a canonical decimal string with at most 6 fractional digits`);
  }

  const negative = trimmed.startsWith('-');
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [wholeRaw, fracRaw = ''] = unsigned.split('.');
  const whole = BigInt(wholeRaw || '0') * MICRO_DOLLARS_PER_USD;
  const frac = BigInt((fracRaw + '000000').slice(0, 6));
  const out = whole + frac;
  return negative ? -out : out;
}

export function canonicalMicros(value) {
  const x = micros(value, 'canonical value');
  const negative = x < 0n;
  const abs = negative ? -x : x;
  const whole = abs / MICRO_DOLLARS_PER_USD;
  const frac = String(abs % MICRO_DOLLARS_PER_USD).padStart(6, '0');
  return `${negative ? '-' : ''}${whole}.${frac}`;
}

export function addMicros(...values) {
  return values.reduce((acc, value) => acc + micros(value), 0n);
}

export function subMicros(left, right) {
  return micros(left, 'left') - micros(right, 'right');
}

export function mulMicrosByBps(value, bps, label = 'bps') {
  const amount = micros(value, 'amount');
  if (!Number.isInteger(bps) || bps < 0 || bps > 1_000_000) {
    throw new Error(`${label} must be a non-negative integer basis-point value`);
  }
  return (amount * BigInt(bps)) / BPS_DENOMINATOR;
}

export function compareMicros(left, right) {
  const a = micros(left, 'left');
  const b = micros(right, 'right');
  if (a === b) return 0;
  return a > b ? 1 : -1;
}

export function canonicalLedgerObject(object = {}) {
  const out = {};
  for (const [key, value] of Object.entries(object).sort(([a], [b]) => a.localeCompare(b))) {
    out[key] = typeof value === 'bigint' ? canonicalMicros(value) : value;
  }
  return out;
}
