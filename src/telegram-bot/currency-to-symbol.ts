import { Currency } from '@prisma/client';
import { UnreachableCaseError } from 'ts-essentials';

export const currencyToSymbol = (currency: Currency) => {
  switch (currency) {
    case Currency.USD:
      return '$';
    case Currency.TRY:
      return '₺';
    case Currency.EUR:
      return '€';
    case Currency.RUB:
      return '₽';
    default:
      throw new UnreachableCaseError(currency);
  }
};
