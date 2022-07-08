import { UserTransactionExpenseRowItem } from '../../repository/transaction-repository';
import { BankAccount } from '@prisma/client';
import { buildStatisticGridMenu } from './build-statistic-grid-menu';
import { Markup } from 'telegraf';
import { BotCallbackQuery } from '../bot-action';

export const buildMonthStatisticsMenu = (
  statisticRows: UserTransactionExpenseRowItem[],
  bankAccount: Pick<BankAccount, 'shortId' | 'currency'>
) => {
  return [
    ...statisticRows.map((row) => {
      return buildStatisticGridMenu(row, bankAccount, 1);
    }),
    [
      Markup.button.callback(
        '◀️ Back',
        `${BotCallbackQuery.SelectBankAccount}:${bankAccount.shortId}`
      ),
    ],
  ];
};
