import { Currency } from '../types';

const parseCurrency = (currencyString: string): Currency => {
  switch (currencyString) {
    case 'TL':
      return 'TRY';
    case 'USD':
      return 'USD';
    default:
      throw new Error(`Invalid currency ${currencyString}`);
  }
};

export const parseMoney = (moneyString: string) => {
  const [amountString, currencyString] = moneyString.split(' ');
  const amount = parseInt(amountString.replace(/[.,]/g, ''));
  if (isNaN(amount)) {
    throw new Error(`Invalid money: ${moneyString}`);
  }

  return {
    amount: amount,
    currency: parseCurrency(currencyString),
  };
};
