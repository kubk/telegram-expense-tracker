import { Currency } from '@prisma/client';

export const currencyConvert = (
  amount: number,
  from: Currency,
  to: Currency
) => {
  if (from === Currency.TRY && to === Currency.USD) {
    return { amount: Math.ceil(amount / 14.8), currency: to };
  }
  throw new Error(`Unsupported currency pair: ${from} -> ${to}`);
};
