/**
 * Thrown when an operation involves Money instances in different currencies.
 *
 * @example
 * ```ts
 * const usd = Money.of(10, 'USD');
 * const eur = Money.of(10, 'EUR');
 * usd.plus(eur); // throws DifferentCurrencyException
 * ```
 */
export class DifferentCurrencyException extends Error {
  /**
   * @param currency1 - First currency code.
   * @param currency2 - Second currency code (the one that didn't match).
   */
  constructor(currency1: string, currency2: string) {
    super(`Different currencies: ${currency1} and ${currency2}.`);
  }
}
