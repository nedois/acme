import Big from 'big.js';

/**
 * Computes base^exp using arbitrary-precision arithmetic.
 *
 * Avoids floating-point errors when working with decimal powers (e.g. 10^2 for cents).
 *
 * @param base - The base number.
 * @param exp - The exponent (can be negative for fractional results).
 * @returns Big instance with the result.
 */
export function safePower(base: number, exp: number) {
  let result = new Big(1);
  let b = new Big(base);
  let e = Math.abs(Math.round(exp));

  while (e > 0) {
    if (e % 2 === 1) result = result.times(b);
    b = b.times(b);
    e = Math.floor(e / 2);
  }

  return exp < 0 ? new Big(1).div(result) : result;
}
