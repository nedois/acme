# @nedois/money-core

Immutable value objects for monetary amounts with arbitrary-precision arithmetic. Avoids floating-point errors and supports 20+ currencies out of the box.

## Installation

```bash
pnpm add @nedois/money-core
```

## Quick Start

```ts
import { Money, exchange } from '@nedois/money-core';

const price = Money.of(19.99, 'USD');
const total = price.times(3);
console.log(total.format()); // "$59.97"

const rates = { USD: 1, EUR: 0.92 };
const eur = exchange(total, 'EUR', rates);
console.log(eur.format()); // "55,17 €"
```

## Features

- **Arbitrary-precision** — Uses [big.js](https://github.com/MikeMcl/big.js/) to avoid floating-point rounding errors
- **Immutable** — All operations return new instances; originals are never mutated
- **Type-safe** — Full TypeScript support
- **20+ currencies** — USD, EUR, GBP, JPY, and more built-in
- **Extensible** — Register custom currencies

## Money API

### Creation

```ts
Money.of(19.99, 'USD');           // From major units
Money.fromCents(1999, 'USD');     // From minor units (cents)
Money.fromJSON({ amount: 19.99, currency: 'USD' });
Money.zero('EUR');                // Zero amount
```

### Arithmetic

```ts
a.plus(b);      // Add (same currency required)
a.minus(b);     // Subtract
a.times(3);     // Multiply by scalar
a.divide(4);    // Divide by scalar
a.abs();        // Absolute value
a.negate();     // Negate
```

### Percentages

```ts
a.percentage(0.1);      // 10% of amount
a.percentageOf(base);   // What fraction is a of base? (returns 0–1)
a.discount(0.1);       // Subtract 10%
a.markup(0.1);         // Add 10%
```

### Tax

```ts
const net = Money.of(100, 'USD');
const { gross, tax } = net.withTax(0.2);  // Add 20% VAT

const gross = Money.of(120, 'USD');
const { net, tax } = gross.extractTax(0.2);  // Extract 20% VAT
```

### Allocation

```ts
Money.of(1, 'USD').allocate(3);           // Split into 3 equal parts
Money.of(100, 'USD').allocateByRatio([1, 2, 1]);  // Split 1:2:1
```

### Comparison

```ts
a.eq(b);   a.gt(b);   a.gte(b);   a.lt(b);   a.lte(b);
a.isZero();  a.isPositive();  a.isNegative();
```

### Formatting & Serialization

```ts
money.format();                    // "$19.99"
money.format({ locale: 'de-DE' }); // "19,99 $"
money.format({ showCode: true });  // "$19.99 USD"
money.toCents();                   // 1999
money.toNumber();                 // 19.99
money.toJSON();                    // { amount: 19.99, currency: 'USD' }
```

### Static

```ts
Money.sum([a, b, c]);  // Sum array (same currency)
```

## Currency Exchange

Pass a rates object keyed by currency code. Rates are relative to a common base (e.g. USD = 1):

```ts
import { exchange, type ExchangeRates } from '@nedois/money-core';

const rates: ExchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 150.5,
};

const usd = Money.of(100, 'USD');
exchange(usd, 'EUR', rates);  // 92 EUR
exchange(usd, 'JPY', rates);  // 15,050 JPY

const eur = Money.of(100, 'EUR');
exchange(eur, 'USD', rates);  // ~108.70 USD (converts between non-base currencies)
```

## Custom Currencies

```ts
import { registerCurrency } from '@nedois/money-core';

registerCurrency('XXX', 2, 'en-US', 'X');
const amount = Money.of(10, 'XXX');
```

## Exceptions

| Exception | When |
|-----------|------|
| `UnknownCurrencyException` | Currency not in registry |
| `DifferentCurrencyException` | Mixing currencies in arithmetic |
| `InvalidArgumentException` | Invalid args (e.g. allocate(0), missing rate) |

## Supported Currencies

AOA, ARS, AUD, AWG, AZN, BAM, BDT, BGN, BHD, BIF, BRL, CAD, CHF, CNY, EUR, GBP, INR, JPY, KRW, MXN, USD

## Scripts

```bash
pnpm build   # Compile TypeScript
pnpm test    # Run tests
pnpm lint    # Lint & fix
```

## License

Private — part of the acme monorepo.
