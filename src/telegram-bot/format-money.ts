import { Currency } from '@prisma/client';
import { currencyToSymbol } from './currency-to-symbol';

export const formatMoney = (
  money: { amount: number; currency: Currency },
  options: {
    asFloat: boolean;
  } = { asFloat: false }
) => {
  const { amount, currency } = money;

  const truncatedAmount = options.asFloat
    ? parseFloat((amount / 100).toFixed(2))
    : Math.ceil(amount / 100);
  const truncatedAmountWithSign =
    truncatedAmount <= 0 ? truncatedAmount : `+${truncatedAmount}`;

  return `${truncatedAmountWithSign}${currencyToSymbol(currency)}`;
};
