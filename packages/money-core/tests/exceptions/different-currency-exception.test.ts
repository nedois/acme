import { describe, expect, it } from 'vitest';

import { DifferentCurrencyException } from '../../src/exceptions/different-currency-exception.js';

describe('DifferentCurrencyException', () => {
  it('has correct message', () => {
    const err = new DifferentCurrencyException('USD', 'EUR');
    expect(err.message).toBe('Different currencies: USD and EUR.');
  });

  it('is instance of Error', () => {
    const err = new DifferentCurrencyException('USD', 'EUR');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(DifferentCurrencyException);
  });
});
