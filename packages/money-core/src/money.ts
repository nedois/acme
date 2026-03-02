import Big from 'big.js';

import { safePower } from './calculator.js';
import { currencies } from './currencies.js';
import { DifferentCurrencyException } from './exceptions/different-currency-exception.js';
import { InvalidArgumentException } from './exceptions/invalid-argument-exception.js';
import { UnknownCurrencyException } from './exceptions/unknown-currency-exception.js';

/**
 * Immutable value object representing a monetary amount in a specific currency.
 *
 * Uses arbitrary-precision arithmetic (via big.js) to avoid floating-point errors.
 * All arithmetic operations return new Money instances; the original is never mutated.
 *
 * @example
 * ```ts
 * const price = Money.of(19.99, 'USD');
 * const total = price.times(3);
 * console.log(total.format()); // "$59.97"
 * ```
 */
export class Money {
  /** Default currency when none is specified. */
  static DEFAULT_CURRENCY = 'USD';

  /** The numeric amount in major units (e.g. dollars, not cents). */
  get amount() {
    return this.#amount.toNumber();
  }

  /** The ISO 4217 currency code (e.g. "USD", "EUR"). */
  get currency() {
    return this.#currency;
  }

  #amount: Big;

  #currency: string;

  get #config() {
    const config = currencies[this.#currency];

    if (!config) {
      throw new UnknownCurrencyException(this.#currency);
    }

    return config;
  }

  /**
   * Creates a Money instance from a numeric amount in major units.
   *
   * @param amount - The amount in major units (e.g. 19.99 for $19.99).
   * @param currency - ISO 4217 currency code. Defaults to USD.
   * @throws {UnknownCurrencyException} When the currency is not registered.
   */
  constructor(amount: number, currency: string = Money.DEFAULT_CURRENCY) {
    this.#amount = new Big(amount);
    this.#currency = currency.toUpperCase();

    if (!currencies[this.currency]) {
      throw new UnknownCurrencyException(this.currency);
    }
  }

  /**
   * Creates a Money instance from an amount in minor units (cents).
   *
   * @param cents - The amount in minor units (e.g. 1999 for $19.99).
   * @param currency - ISO 4217 currency code. Defaults to USD.
   * @returns A new Money instance.
   * @throws {UnknownCurrencyException} When the currency is not registered.
   */
  static fromCents(cents: number, currency: string = Money.DEFAULT_CURRENCY) {
    const curr = currencies[currency.toUpperCase()];

    if (!curr) {
      throw new UnknownCurrencyException(currency);
    }

    const divisor = safePower(10, curr.decimals);
    const amount = Number.parseFloat(new Big(cents).div(divisor).toFixed(curr.decimals));

    return new Money(amount, curr.code);
  }

  /**
   * Creates a Money instance from a JSON-serialized object.
   *
   * @param data - Object with `amount` and `currency` properties.
   * @returns A new Money instance.
   */
  static fromJSON(data: { amount: number, currency: string }): Money {
    return new Money(data.amount, data.currency);
  }

  /**
   * Factory method to create a Money instance. Alias for the constructor.
   *
   * @param amount - The amount in major units.
   * @param currency - ISO 4217 currency code. Defaults to USD.
   * @returns A new Money instance.
   */
  static of(amount: number, currency: string = Money.DEFAULT_CURRENCY) {
    return new Money(amount, currency);
  }

  /**
   * Sums an array of Money instances. All must be in the same currency.
   *
   * @param items - Array of Money instances to sum.
   * @returns The total. Returns zero in the first item's currency if array is empty.
   * @throws {DifferentCurrencyException} When items have mixed currencies.
   */
  static sum(items: Money[]) {
    const currency = items[0]?.currency ?? Money.DEFAULT_CURRENCY;
    return items.reduce((acc, item) => acc.plus(item), Money.zero(currency));
  }

  /**
   * Creates a Money instance with zero amount.
   *
   * @param currency - ISO 4217 currency code. Defaults to USD.
   * @returns A new Money instance with amount 0.
   */
  static zero(currency: string = Money.DEFAULT_CURRENCY) {
    return new Money(0, currency);
  }

  /** Returns the absolute value of this amount. */
  abs() {
    return new Money(this.#amount.abs().toNumber(), this.#currency);
  }

  /**
   * Splits this amount into equal parts, distributing any remainder to the first parts.
   *
   * @param parts - Number of parts to split into (must be > 0).
   * @returns Array of Money instances summing to this amount.
   * @throws {InvalidArgumentException} When parts <= 0.
   */
  allocate(parts: number) {
    if (parts <= 0) {
      throw new InvalidArgumentException('n must be greater than 0');
    }

    const decimals = this.#config.decimals;
    const cents = this.toCents();
    const base = Math.floor(cents / parts);
    const remainder = cents - base * parts;
    const unit = new Big(1).div(safePower(10, decimals));

    return Array.from({ length: parts }, (_, i) => {
      const amount = base + (i < remainder ? 1 : 0);
      return new Money(amount * unit.toNumber(), this.#currency);
    });
  }

  /**
   * Splits this amount according to the given ratios.
   *
   * @param ratios - Array of ratios (e.g. [1, 2, 3] for 1:2:3 split).
   * @returns Array of Money instances in the same order as ratios.
   * @throws {InvalidArgumentException} When ratios sum to 0.
   */
  allocateByRatio(ratios: number[]) {
    const total = ratios.reduce((sum, ratio) => sum + ratio, 0);

    if (total === 0) {
      throw new InvalidArgumentException('Ratios must sum to > 0');
    }

    const totalCents = this.toCents();
    let distributed = 0;
    return ratios.map((ratio, index) => {
      if (index === ratios.length - 1) {
        return Money.fromCents(totalCents - distributed, this.#currency);
      }
      const share = Math.round((totalCents * ratio) / total);
      distributed += share;
      return Money.fromCents(share, this.#currency);
    });
  }

  /**
   * Returns this amount minus the given percentage.
   *
   * @param percentage - Decimal rate (e.g. 0.1 for 10%).
   * @returns New Money instance.
   */
  discount(percentage: number) {
    return this.minus(this.percentage(percentage));
  }

  /**
   * Divides this amount by a scalar.
   *
   * @param divisor - Number to divide by.
   * @returns New Money instance.
   */
  divide(divisor: number) {
    return new Money(this.#amount.div(divisor).toNumber(), this.#currency);
  }

  /**
   * Checks if this amount equals another (same currency required).
   *
   * @param other - Money to compare.
   * @returns True if amounts are equal.
   * @throws {DifferentCurrencyException} When currencies differ.
   */
  eq(other: Money) {
    this.#assertSameCurrency(other);
    return this.#amount.eq(other.#amount);
  }

  /**
   * Extracts tax from a gross amount. Assumes the amount includes tax at the given rate.
   *
   * @param rate - Tax rate as decimal (e.g. 0.2 for 20% VAT).
   * @returns Object with gross (this), net, and tax amounts.
   */
  extractTax(rate: number): { gross: Money, net: Money, tax: Money } {
    const net = new Money(this.#amount.div(new Big(rate).plus(1)).toNumber(), this.#currency);
    const tax = this.minus(net);
    return { gross: this, net, tax };
  }

  /**
   * Formats this amount as a localized currency string.
   *
   * @param options - Optional locale override and whether to append currency code.
   * @returns Formatted string (e.g. "$19.99" or "19,99 € EUR").
   */
  format(options?: { locale?: string, showCode?: boolean }) {
    const locale = options?.locale ?? this.#config.locale;

    const formatted = new Intl.NumberFormat(locale, {
      currency: this.#currency,
      maximumFractionDigits: this.#config.decimals,
      minimumFractionDigits: this.#config.decimals,
      style: 'currency',
    }).format(this.toNumber());

    return options?.showCode ? `${formatted} ${this.#currency}` : formatted;
  }

  /**
   * Checks if this amount is greater than another.
   *
   * @param other - Money to compare.
   * @returns True if this > other.
   * @throws {DifferentCurrencyException} When currencies differ.
   */
  gt(other: Money) {
    this.#assertSameCurrency(other);
    return this.#amount.gt(other.#amount);
  }

  /**
   * Checks if this amount is greater than or equal to another.
   *
   * @param other - Money to compare.
   * @returns True if this >= other.
   * @throws {DifferentCurrencyException} When currencies differ.
   */
  gte(other: Money) {
    this.#assertSameCurrency(other);
    return this.#amount.gte(other.#amount);
  }

  /** Returns true if the amount is less than zero. */
  isNegative() {
    return this.#amount.lt(0);
  }

  /** Returns true if the amount is greater than zero. */
  isPositive() {
    return this.#amount.gt(0);
  }

  /** Returns true if the amount is exactly zero. */
  isZero() {
    return this.#amount.eq(0);
  }

  /**
   * Checks if this amount is less than another.
   *
   * @param other - Money to compare.
   * @returns True if this < other.
   * @throws {DifferentCurrencyException} When currencies differ.
   */
  lt(other: Money) {
    this.#assertSameCurrency(other);
    return this.#amount.lt(other.#amount);
  }

  /**
   * Checks if this amount is less than or equal to another.
   *
   * @param other - Money to compare.
   * @returns True if this <= other.
   * @throws {DifferentCurrencyException} When currencies differ.
   */
  lte(other: Money) {
    this.#assertSameCurrency(other);
    return this.#amount.lte(other.#amount);
  }

  /**
   * Returns this amount plus the given percentage.
   *
   * @param percentage - Decimal rate (e.g. 0.1 for 10%).
   * @returns New Money instance.
   */
  markup(percentage: number) {
    return this.plus(this.percentage(percentage));
  }

  /**
   * Subtracts another Money from this amount.
   *
   * @param other - Money to subtract.
   * @returns New Money instance.
   * @throws {DifferentCurrencyException} When currencies differ.
   */
  minus(other: Money) {
    this.#assertSameCurrency(other);
    return new Money(this.#amount.minus(other.#amount).toNumber(), this.#currency);
  }

  /** Returns the negated amount (multiplies by -1). */
  negate() {
    return new Money(this.#amount.times(-1).toNumber(), this.#currency);
  }

  /**
   * Returns this amount multiplied by the given percentage (as a decimal).
   *
   * @param percentage - Decimal rate (e.g. 0.1 for 10% of this amount).
   * @returns New Money instance.
   */
  percentage(percentage: number) {
    return new Money(this.#amount.times(percentage).toNumber(), this.#currency);
  }

  /**
   * Returns what fraction this amount is of another (as 0–1).
   *
   * @param base - The base amount to compare against.
   * @returns Fraction as a number between 0 and 1 (e.g. 0.25 for 25%).
   * @throws {InvalidArgumentException} When base is zero.
   * @throws {DifferentCurrencyException} When currencies differ.
   */
  percentageOf(base: Money) {
    this.#assertSameCurrency(base);

    if (base.isZero()) {
      throw new InvalidArgumentException('Cannot compute percentage of zero');
    }

    return Number.parseFloat(this.#amount.div(base.amount).toFixed(4));
  }

  /**
   * Adds another Money to this amount.
   *
   * @param other - Money to add.
   * @returns New Money instance.
   * @throws {DifferentCurrencyException} When currencies differ.
   */
  plus(other: Money) {
    this.#assertSameCurrency(other);
    return new Money(this.#amount.plus(other.#amount).toNumber(), this.#currency);
  }

  /**
   * Multiplies this amount by a scalar.
   *
   * @param multiplier - Number to multiply by.
   * @returns New Money instance.
   */
  times(multiplier: number) {
    return new Money(this.#amount.times(multiplier).toNumber(), this.#currency);
  }

  /**
   * Returns the amount in minor units (cents) as an integer.
   *
   * @returns Integer cents (e.g. 1999 for $19.99).
   */
  toCents() {
    return this.#amount.times(safePower(10, this.#config.decimals)).toNumber();
  }

  /**
   * Returns the amount as a fixed-decimal string with currency precision.
   *
   * @returns String (e.g. "19.99").
   */
  toFixed() {
    return this.#amount.toFixed(this.#config.decimals);
  }

  /**
   * Returns a plain object for JSON serialization.
   *
   * @returns Object with amount and currency.
   */
  toJSON() {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }

  /**
   * Returns the amount rounded to currency precision as a number.
   *
   * @returns Numeric amount (e.g. 19.99).
   */
  toNumber() {
    return Number.parseFloat(this.#amount.toFixed(this.#config.decimals));
  }

  /**
   * Returns a formatted string. Delegates to {@link format}.
   *
   * @param options - Optional locale and showCode.
   * @returns Formatted currency string.
   */
  toString(options?: { locale?: string, showCode?: boolean }) {
    return this.format(options);
  }

  /**
   * Adds tax to this net amount.
   *
   * @param rate - Tax rate as decimal (e.g. 0.2 for 20% VAT).
   * @returns Object with gross (net + tax), net (this), and tax amounts.
   */
  withTax(rate: number): { gross: Money, net: Money, tax: Money } {
    const tax = this.percentage(rate);
    return { gross: this.plus(tax), net: this, tax };
  }

  #assertSameCurrency(other: Money) {
    if (this.#currency !== other.#currency) {
      throw new DifferentCurrencyException(this.#currency, other.#currency);
    }
  }
}
