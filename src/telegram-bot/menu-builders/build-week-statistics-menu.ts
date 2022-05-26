import {
  StatisticGroupByType,
  UserTransactionExpenseRowItem,
} from '../../repository/transaction-repository';
import { BankAccount } from '@prisma/client';
import { buildStatisticGridMenu } from './build-statistic-grid-menu';
import { Markup } from 'telegraf';
import { BotCallbackQuery } from '../bot-action';

export const buildWeekStatisticsMenu = (
  statisticRows: UserTransactionExpenseRowItem[],
  bankAccount: BankAccount
) => {
  return [
    ...statisticRows.map((row) => {
      return buildStatisticGridMenu(
        row,
        StatisticGroupByType.Week,
        bankAccount,
        1
      );
    }),
    [
      Markup.button.callback(
        '◀️ Back',
        `${BotCallbackQuery.SelectBankAccount}:${bankAccount.shortId}`
      ),
    ],
  ];
};
