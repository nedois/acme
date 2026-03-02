import { describe, expect, it } from 'vitest';

import { InvalidArgumentException } from '../src/exceptions/invalid-argument-exception.js';
import { UnknownCurrencyException } from '../src/exceptions/unknown-currency-exception.js';
import { exchange } from '../src/exchange.js';
import { Money } from '../src/money.js';

const rates = { AOA: 920, EUR: 0.92, JPY: 150.5, USD: 1 };

describe('exchange', () => {
  it('converts to target currency using rates object', () => {
    const usd = Money.of(100, 'USD');
    const eur = exchange(usd, 'EUR', rates);
    expect(eur.amount).toBe(92);
    expect(eur.currency).toBe('EUR');
  });

  it('uppercases target currency', () => {
    const usd = Money.of(100, 'USD');
    const eur = exchange(usd, 'eur', rates);
    expect(eur.currency).toBe('EUR');
  });

  it('rounds to target currency decimals', () => {
    const usd = Money.of(100, 'USD');
    const eur = exchange(usd, 'EUR', { EUR: 0.923456, USD: 1 });
    expect(eur.amount).toBe(92.35);
  });

  it('handles zero-decimal currencies (JPY)', () => {
    const usd = Money.of(100, 'USD');
    const jpy = exchange(usd, 'JPY', rates);
    expect(jpy.amount).toBe(15050);
    expect(jpy.currency).toBe('JPY');
  });

  it('throws for unknown target currency', () => {
    const usd = Money.of(100, 'USD');
    expect(() => exchange(usd, 'XXX', { ...rates, XXX: 1 })).toThrow(UnknownCurrencyException);
  });

  it('handles same currency (rate 1)', () => {
    const usd = Money.of(50, 'USD');
    const result = exchange(usd, 'USD', rates);
    expect(result.amount).toBe(50);
    expect(result.currency).toBe('USD');
  });

  it('converts between non-base currencies', () => {
    const eur = Money.of(100, 'EUR');
    const usd = exchange(eur, 'USD', rates);
    expect(usd.amount).toBeCloseTo(108.7, 1);
    expect(usd.currency).toBe('USD');
  });

  it('handles zero amount', () => {
    const usd = Money.zero('USD');
    const eur = exchange(usd, 'EUR', rates);
    expect(eur.amount).toBe(0);
    expect(eur.currency).toBe('EUR');
  });

  it('avoids floating point errors', () => {
    const usd = Money.of(10.01, 'USD');
    const eur = exchange(usd, 'EUR', rates);
    expect(eur.amount).toBe(9.21);
  });

  it('throws when source currency rate is missing', () => {
    const usd = Money.of(100, 'USD');
    expect(() => exchange(usd, 'EUR', { EUR: 0.92 })).toThrow(InvalidArgumentException);
    expect(() => exchange(usd, 'EUR', { EUR: 0.92 })).toThrow('Missing exchange rate for USD');
  });

  it('throws when target currency rate is missing', () => {
    const usd = Money.of(100, 'USD');
    expect(() => exchange(usd, 'EUR', { USD: 1 })).toThrow(InvalidArgumentException);
    expect(() => exchange(usd, 'EUR', { USD: 1 })).toThrow('Missing exchange rate for EUR');
  });
});
