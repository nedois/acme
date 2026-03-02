import Big from 'big.js';

import { currencies } from './currencies.js';
import { InvalidArgumentException } from './exceptions/invalid-argument-exception.js';
import { UnknownCurrencyException } from './exceptions/unknown-currency-exception.js';
import { Money } from './money.js';

/** Exchange rates keyed by ISO 4217 currency code (e.g. { USD: 1, EUR: 0.92 }). */
export type ExchangeRates = Record<string, number>;

/**
 * Converts a Money amount to another currency using the given rates object.
 *
 * Rates are relative to a common base (e.g. USD = 1). The rate is resolved as
 * rates[toCurrency] / rates[fromCurrency].
 *
 * @param money - The amount to convert.
 * @param toCurrency - Target ISO 4217 currency code.
 * @param rates - Object of rates keyed by currency (e.g. { USD: 1, EUR: 0.9, AOA: 920 }).
 * @returns New Money instance in the target currency.
 * @throws {UnknownCurrencyException} When the target currency is not registered.
 * @throws {InvalidArgumentException} When a rate is missing for source or target currency.
 *
 * @example
 * ```ts
 * const rates = { USD: 1, EUR: 0.92, AOA: 920 };
 * const usd = Money.of(100, 'USD');
 * const eur = exchange(usd, 'EUR', rates);
 * console.log(eur.format()); // "92,00 €"
 * ```
 */
export function exchange(money: Money, toCurrency: string, rates: ExchangeRates): Money {
  const source = money.currency;
  const target = toCurrency.toUpperCase();

  if (!currencies[target]) {
    throw new UnknownCurrencyException(toCurrency);
  }

  const sourceRate = rates[source];
  const targetRate = rates[target];

  if (sourceRate === undefined) {
    throw new InvalidArgumentException(`Missing exchange rate for ${source}`);
  }

  if (targetRate === undefined) {
    throw new InvalidArgumentException(`Missing exchange rate for ${target}`);
  }

  const rate = targetRate / sourceRate;
  const config = currencies[target];
  const convertedAmount = Number.parseFloat(
    new Big(money.amount).times(rate).toFixed(config.decimals),
  );
  return new Money(convertedAmount, target);
}
