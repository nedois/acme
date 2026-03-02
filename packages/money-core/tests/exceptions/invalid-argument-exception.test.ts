import { describe, expect, it } from 'vitest';

import { InvalidArgumentException } from '../../src/exceptions/invalid-argument-exception.js';

describe('InvalidArgumentException', () => {
  it('has custom message', () => {
    const err = new InvalidArgumentException('n must be greater than 0');
    expect(err.message).toBe('n must be greater than 0');
  });

  it('is instance of Error', () => {
    const err = new InvalidArgumentException('test');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(InvalidArgumentException);
  });
});
