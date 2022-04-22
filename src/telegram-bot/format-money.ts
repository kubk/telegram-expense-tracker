import { Currency } from '@prisma/client';
import { currencyToSymbol } from './currency-to-symbol';

export const formatMoney = (amount: number, currency: Currency) => {
  const truncatedAmount = Math.ceil(amount / 100);
  const truncatedAmountWithSign =
    truncatedAmount <= 0 ? truncatedAmount : `+${truncatedAmount}`;

  return `${truncatedAmountWithSign}${currencyToSymbol(currency)}`;
};
