import { describe, expect, it } from 'vitest';

import { DifferentCurrencyException } from '../src/exceptions/different-currency-exception.js';
import { InvalidArgumentException } from '../src/exceptions/invalid-argument-exception.js';
import { UnknownCurrencyException } from '../src/exceptions/unknown-currency-exception.js';
import { Money } from '../src/money.js';

describe('Money', () => {
  describe('constructor', () => {
    it('creates instance with amount and currency', () => {
      const money = new Money(10.5, 'USD');
      expect(money.amount).toBe(10.5);
      expect(money.currency).toBe('USD');
    });

    it('uppercases currency code', () => {
      const money = new Money(10, 'eur');
      expect(money.currency).toBe('EUR');
    });

    it('defaults to USD when currency omitted', () => {
      const money = new Money(10);
      expect(money.currency).toBe('USD');
    });

    it('throws for unknown currency', () => {
      expect(() => new Money(10, 'XXX')).toThrow(UnknownCurrencyException);
    });
  });

  describe('static.fromCents', () => {
    it('converts cents to major units', () => {
      const money = Money.fromCents(1999, 'USD');
      expect(money.amount).toBe(19.99);
      expect(money.currency).toBe('USD');
    });

    it('handles zero-decimal currencies (JPY)', () => {
      const money = Money.fromCents(1000, 'JPY');
      expect(money.amount).toBe(1000);
    });

    it('throws for unknown currency', () => {
      expect(() => Money.fromCents(100, 'XXX')).toThrow(UnknownCurrencyException);
    });
  });

  describe('static.fromJSON', () => {
    it('creates from JSON object', () => {
      const money = Money.fromJSON({ amount: 25.5, currency: 'EUR' });
      expect(money.amount).toBe(25.5);
      expect(money.currency).toBe('EUR');
    });
  });

  describe('static.of', () => {
    it('creates instance (alias for constructor)', () => {
      const money = Money.of(10, 'GBP');
      expect(money.amount).toBe(10);
      expect(money.currency).toBe('GBP');
    });
  });

  describe('static.sum', () => {
    it('sums array of same currency', () => {
      const items = [Money.of(10, 'USD'), Money.of(20, 'USD'), Money.of(5, 'USD')];
      const total = Money.sum(items);
      expect(total.amount).toBe(35);
      expect(total.currency).toBe('USD');
    });

    it('returns zero for empty array', () => {
      const total = Money.sum([]);
      expect(total.amount).toBe(0);
      expect(total.currency).toBe('USD');
    });

    it('throws for mixed currencies', () => {
      const items = [Money.of(10, 'USD'), Money.of(20, 'EUR')];
      expect(() => Money.sum(items)).toThrow(DifferentCurrencyException);
    });
  });

  describe('static.zero', () => {
    it('creates zero amount', () => {
      const money = Money.zero('EUR');
      expect(money.amount).toBe(0);
      expect(money.currency).toBe('EUR');
    });
  });

  describe('arithmetic', () => {
    it('plus adds amounts', () => {
      const a = Money.of(10, 'USD');
      const b = Money.of(5, 'USD');
      expect(a.plus(b).amount).toBe(15);
    });

    it('minus subtracts amounts', () => {
      const a = Money.of(10, 'USD');
      const b = Money.of(3, 'USD');
      expect(a.minus(b).amount).toBe(7);
    });

    it('times multiplies by scalar', () => {
      const money = Money.of(10, 'USD');
      expect(money.times(3).amount).toBe(30);
    });

    it('divide divides by scalar', () => {
      const money = Money.of(10, 'USD');
      expect(money.divide(4).amount).toBe(2.5);
    });

    it('plus/minus throw for different currencies', () => {
      const usd = Money.of(10, 'USD');
      const eur = Money.of(10, 'EUR');
      expect(() => usd.plus(eur)).toThrow(DifferentCurrencyException);
      expect(() => usd.minus(eur)).toThrow(DifferentCurrencyException);
    });
  });

  describe('comparison', () => {
    it('eq returns true for equal amounts', () => {
      const a = Money.of(10, 'USD');
      const b = Money.of(10, 'USD');
      expect(a.eq(b)).toBe(true);
    });

    it('eq returns false for different amounts', () => {
      const a = Money.of(10, 'USD');
      const b = Money.of(11, 'USD');
      expect(a.eq(b)).toBe(false);
    });

    it('gt, gte, lt, lte work correctly', () => {
      const a = Money.of(10, 'USD');
      const b = Money.of(5, 'USD');
      expect(a.gt(b)).toBe(true);
      expect(a.gte(b)).toBe(true);
      expect(a.lt(b)).toBe(false);
      expect(a.lte(b)).toBe(false);
      expect(b.lt(a)).toBe(true);
      expect(a.gte(a)).toBe(true);
    });

    it('comparison throws for different currencies', () => {
      const usd = Money.of(10, 'USD');
      const eur = Money.of(10, 'EUR');
      expect(() => usd.eq(eur)).toThrow(DifferentCurrencyException);
    });
  });

  describe('predicates', () => {
    it('isZero, isPositive, isNegative', () => {
      expect(Money.zero('USD').isZero()).toBe(true);
      expect(Money.of(10, 'USD').isPositive()).toBe(true);
      expect(Money.of(-10, 'USD').isNegative()).toBe(true);
    });
  });

  describe('percentage', () => {
    it('percentage returns fraction of amount', () => {
      const money = Money.of(100, 'USD');
      expect(money.percentage(0.1).amount).toBe(10);
    });

    it('percentageOf returns fraction as 0-1', () => {
      const a = Money.of(25, 'USD');
      const b = Money.of(100, 'USD');
      expect(a.percentageOf(b)).toBe(0.25);
    });

    it('percentageOf throws for zero base', () => {
      const a = Money.of(25, 'USD');
      const b = Money.zero('USD');
      expect(() => a.percentageOf(b)).toThrow(InvalidArgumentException);
    });

    it('discount subtracts percentage', () => {
      const money = Money.of(100, 'USD');
      expect(money.discount(0.1).amount).toBe(90);
    });

    it('markup adds percentage', () => {
      const money = Money.of(100, 'USD');
      expect(money.markup(0.1).amount).toBe(110);
    });
  });

  describe('allocate', () => {
    it('splits into equal parts', () => {
      const money = Money.of(1, 'USD');
      const parts = money.allocate(3);
      expect(parts).toHaveLength(3);
      expect(parts.reduce((sum, p) => sum + p.amount, 0)).toBeCloseTo(1);
      expect(parts[0].amount).toBeCloseTo(0.34);
      expect(parts[1].amount).toBeCloseTo(0.33);
      expect(parts[2].amount).toBeCloseTo(0.33);
    });

    it('throws for parts <= 0', () => {
      const money = Money.of(10, 'USD');
      expect(() => money.allocate(0)).toThrow(InvalidArgumentException);
      expect(() => money.allocate(-1)).toThrow(InvalidArgumentException);
    });
  });

  describe('allocateByRatio', () => {
    it('splits by ratio', () => {
      const money = Money.of(100, 'USD');
      const parts = money.allocateByRatio([1, 2, 1]);
      expect(parts).toHaveLength(3);
      expect(parts.reduce((sum, p) => sum + p.amount, 0)).toBeCloseTo(100);
      expect(parts[0].amount).toBeCloseTo(25);
      expect(parts[1].amount).toBeCloseTo(50);
      expect(parts[2].amount).toBeCloseTo(25);
    });

    it('throws when ratios sum to 0', () => {
      const money = Money.of(100, 'USD');
      expect(() => money.allocateByRatio([0, 0])).toThrow(InvalidArgumentException);
    });
  });

  describe('tax', () => {
    it('withTax adds tax to net', () => {
      const net = Money.of(100, 'USD');
      const { gross, tax } = net.withTax(0.2);
      expect(tax.amount).toBe(20);
      expect(gross.amount).toBe(120);
    });

    it('extractTax subtracts tax from gross', () => {
      const gross = Money.of(120, 'USD');
      const { net, tax } = gross.extractTax(0.2);
      expect(net.amount).toBe(100);
      expect(tax.amount).toBe(20);
    });
  });

  describe('abs', () => {
    it('returns absolute value', () => {
      const money = Money.of(-10, 'USD');
      expect(money.abs().amount).toBe(10);
    });
  });

  describe('negate', () => {
    it('negates amount', () => {
      const money = Money.of(10, 'USD');
      expect(money.negate().amount).toBe(-10);
    });
  });

  describe('toCents', () => {
    it('returns amount in minor units', () => {
      const money = Money.of(19.99, 'USD');
      expect(money.toCents()).toBe(1999);
    });
  });

  describe('toJSON', () => {
    it('returns serializable object', () => {
      const money = Money.of(10.5, 'EUR');
      expect(money.toJSON()).toEqual({ amount: 10.5, currency: 'EUR' });
    });
  });

  describe('format', () => {
    it('formats as currency string', () => {
      const money = Money.of(19.99, 'USD');
      expect(money.format()).toContain('19.99');
    });

    it('accepts locale override', () => {
      const money = Money.of(19.99, 'EUR');
      const formatted = money.format({ locale: 'en-US' });
      expect(formatted).toMatch(/[\d,.]+\s*€?/);
    });
  });

  describe('immutability', () => {
    it('operations return new instances', () => {
      const original = Money.of(10, 'USD');
      const result = original.plus(Money.of(5, 'USD'));
      expect(original.amount).toBe(10);
      expect(result.amount).toBe(15);
      expect(result).not.toBe(original);
    });
  });
});
