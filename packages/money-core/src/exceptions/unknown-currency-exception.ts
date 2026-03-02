/**
 * Thrown when a currency code is not in the registry.
 *
 * Use {@link registerCurrency} to add support for additional currencies.
 *
 * @example
 * ```ts
 * Money.of(10, 'XXX');  // throws UnknownCurrencyException
 * ```
 */
export class UnknownCurrencyException extends Error {
  /**
   * @param currency - The unrecognized currency code.
   */
  constructor(currency: string) {
    super(`Unknown currency: ${currency}. Please register it with registerCurrency() first.`);
  }
}
