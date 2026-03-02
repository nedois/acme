import { afterEach, describe, expect, it } from 'vitest';

import { currencies, registerCurrency } from '../src/currencies.js';
import { Money } from '../src/money.js';

describe('currencies', () => {
  it('contains USD', () => {
    expect(currencies.USD).toBeDefined();
    expect(currencies.USD.code).toBe('USD');
    expect(currencies.USD.decimals).toBe(2);
  });

  it('contains EUR', () => {
    expect(currencies.EUR).toBeDefined();
    expect(currencies.EUR.decimals).toBe(2);
  });

  it('contains JPY with zero decimals', () => {
    expect(currencies.JPY).toBeDefined();
    expect(currencies.JPY.decimals).toBe(0);
  });
});

describe('registerCurrency', () => {
  afterEach(() => {
    delete currencies.TEST;
  });

  it('adds new currency to registry', () => {
    registerCurrency('TEST', 2, 'en-US', 'T');
    expect(currencies.TEST).toEqual({
      code: 'TEST',
      decimals: 2,
      locale: 'en-US',
      symbol: 'T',
    });
  });

  it('allows Money to use registered currency', () => {
    registerCurrency('TEST', 2, 'en-US', 'T');
    const money = Money.of(10, 'TEST');
    expect(money.amount).toBe(10);
    expect(money.currency).toBe('TEST');
  });
});
