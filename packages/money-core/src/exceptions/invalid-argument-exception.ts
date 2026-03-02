/**
 * Thrown when a method receives an invalid argument.
 *
 * @example
 * ```ts
 * Money.of(10).allocate(0);  // throws: n must be greater than 0
 * Money.of(10).allocateByRatio([0, 0]);  // throws: Ratios must sum to > 0
 * ```
 */
export class InvalidArgumentException extends Error {
  /**
   * @param message - Human-readable description of the error.
   */
  constructor(message: string) {
    super(message);
  }
}
