import { describe, expect, it } from 'vitest';

import { safePower } from '../src/calculator.js';

describe('safePower', () => {
  it('computes positive integer powers', () => {
    expect(safePower(2, 3).toNumber()).toBe(8);
    expect(safePower(10, 2).toNumber()).toBe(100);
  });

  it('handles zero exponent', () => {
    expect(safePower(5, 0).toNumber()).toBe(1);
  });

  it('handles zero base', () => {
    expect(safePower(0, 5).toNumber()).toBe(0);
  });

  it('handles negative exponent', () => {
    expect(safePower(10, -2).toNumber()).toBe(0.01);
  });

  it('handles decimal exponent (rounds to nearest integer)', () => {
    expect(safePower(10, 2.7).toNumber()).toBe(1000); // 2.7 rounds to 3
    expect(safePower(10, 2.2).toNumber()).toBe(100); // 2.2 rounds to 2
  });

  it('avoids floating point errors for 10^n', () => {
    const result = safePower(10, 2);
    expect(result.toNumber()).toBe(100);
  });
});
