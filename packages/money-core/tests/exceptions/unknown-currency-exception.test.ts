import { describe, expect, it } from 'vitest';

import { UnknownCurrencyException } from '../../src/exceptions/unknown-currency-exception.js';

describe('UnknownCurrencyException', () => {
  it('has correct message', () => {
    const err = new UnknownCurrencyException('XXX');
    expect(err.message).toContain('XXX');
    expect(err.message).toContain('registerCurrency');
  });

  it('is instance of Error', () => {
    const err = new UnknownCurrencyException('XXX');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(UnknownCurrencyException);
  });
});
