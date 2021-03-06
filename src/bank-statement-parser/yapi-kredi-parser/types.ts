import { Currency } from '@prisma/client';

export enum YapiKrediCurrency {
  TRY = 'TL',
  USD = 'USD',
}

export type Transaction = {
  createdAt: Date;
  amount: number; // multiplied by 100 to not operate decimals on money
  currency: Currency;
  title: string;
  info: string;
};
