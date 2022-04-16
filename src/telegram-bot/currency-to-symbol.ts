import { Currency } from '@prisma/client';

export const currencyToSymbol = (currency: Currency) => {
  switch (currency) {
    case Currency.USD:
      return '$';
    case Currency.TRY:
      return '₺';
    default:
      throw new Error(`Unsupported currency: ${currency}`);
  }
};

export const isValidCurrency = (currency: any): currency is Currency => {
  return Object.values(Currency).includes(currency);
};
