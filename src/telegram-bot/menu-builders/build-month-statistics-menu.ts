import {
  StatisticGroupByType,
  UserTransactionExpenseRowItem,
} from '../../repository/transaction-repository';
import { Currency } from '@prisma/client';
import { buildStatisticGridMenu } from './build-statistic-grid-menu';
import { Markup } from 'telegraf';
import { BotCallbackQuery } from '../bot-action';

export const buildMonthStatisticsMenu = (
  statisticRows: UserTransactionExpenseRowItem[],
  bankAccount: { id: string; currency: Currency }
) => {
  return [
    ...statisticRows.map((row) => {
      return buildStatisticGridMenu(
        row,
        StatisticGroupByType.Month,
        bankAccount,
        1
      );
    }),
    [
      Markup.button.callback(
        '◀️ Back',
        `${BotCallbackQuery.SelectBankAccount}:${bankAccount.id}`
      ),
    ],
  ];
};
