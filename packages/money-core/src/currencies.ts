/**
 * Configuration for a supported currency.
 */
export type Currency = {
  /** ISO 4217 currency code (e.g. "USD", "EUR"). */
  code: string
  /** Number of decimal places for minor units (e.g. 2 for cents). */
  decimals: number
  /** BCP 47 locale for formatting (e.g. "en-US"). */
  locale: string
  /** Currency symbol for display (e.g. "$", "€"). */
  symbol: string
};

/** Registry of supported currencies, keyed by ISO 4217 code. */
export const currencies: Record<string, Currency> = {
  AOA: { code: 'AOA', decimals: 2, locale: 'pt-AO', symbol: 'AOA' },
  ARS: { code: 'ARS', decimals: 2, locale: 'es-AR', symbol: '$' },
  AUD: { code: 'AUD', decimals: 2, locale: 'en-AU', symbol: 'A$' },
  AWG: { code: 'AWG', decimals: 2, locale: 'nl-AW', symbol: 'AWG' },
  AZN: { code: 'AZN', decimals: 2, locale: 'az-AZ', symbol: 'AZN' },
  BAM: { code: 'BAM', decimals: 2, locale: 'bs-BA', symbol: 'KM' },
  BDT: { code: 'BDT', decimals: 2, locale: 'bn-BD', symbol: '৳' },
  BGN: { code: 'BGN', decimals: 2, locale: 'bg-BG', symbol: 'лв' },
  BHD: { code: 'BHD', decimals: 3, locale: 'ar-BH', symbol: 'BD' },
  BIF: { code: 'BIF', decimals: 0, locale: 'fr-BI', symbol: 'FBu' },
  BRL: { code: 'BRL', decimals: 2, locale: 'pt-BR', symbol: 'R$' },
  CAD: { code: 'CAD', decimals: 2, locale: 'en-CA', symbol: 'CA$' },
  CHF: { code: 'CHF', decimals: 2, locale: 'de-CH', symbol: 'CHF' },
  CNY: { code: 'CNY', decimals: 2, locale: 'zh-CN', symbol: '¥' },
  EUR: { code: 'EUR', decimals: 2, locale: 'de-DE', symbol: '€' },
  GBP: { code: 'GBP', decimals: 2, locale: 'en-GB', symbol: '£' },
  INR: { code: 'INR', decimals: 2, locale: 'en-IN', symbol: '₹' },
  JPY: { code: 'JPY', decimals: 0, locale: 'ja-JP', symbol: '¥' },
  KRW: { code: 'KRW', decimals: 0, locale: 'ko-KR', symbol: '₩' },
  MXN: { code: 'MXN', decimals: 2, locale: 'es-MX', symbol: 'MX$' },
  USD: { code: 'USD', decimals: 2, locale: 'en-US', symbol: '$' },
};

/**
 * Registers a custom currency for use with Money.
 *
 * @param currency - ISO 4217 currency code (will be uppercased).
 * @param decimals - Number of decimal places (e.g. 2 for cents).
 * @param locale - BCP 47 locale for formatting.
 * @param symbol - Currency symbol for display.
 */
export function registerCurrency(currency: string, decimals: number, locale: string, symbol: string) {
  currencies[currency] = { code: currency, decimals, locale, symbol };
}
