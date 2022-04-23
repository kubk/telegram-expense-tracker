import { BankAccount, Currency } from '@prisma/client';
import { Markup } from 'telegraf';
import { BotCallbackQuery } from './bot-action';
import {
  type UserTransactionExpenseRowItem,
  UserTransactionListFilter,
} from '../repository/transaction-repository';
import { formatMoney } from './format-money';
import { UnreachableCaseError } from 'ts-essentials';

type StatisticGroupByType = 'week' | 'month';

const getInlineQueryType = (type: StatisticGroupByType) => {
  switch (type) {
    case 'month':
      return BotCallbackQuery.SelectStatisticsMonth;
    case 'week':
      return BotCallbackQuery.SelectStatisticsWeek;
    default:
      throw new UnreachableCaseError(type);
  }
};

const buildStatisticGrid = (
  row: UserTransactionExpenseRowItem,
  type: StatisticGroupByType,
  bankAccount: { id: string; currency: Currency }
) => {
  const inlineQueryType = getInlineQueryType(type);

  return [
    Markup.button.callback(
      `${row.groupname} ${formatMoney(
        row.difference,
        bankAccount.currency
      ).padStart(10, ' ')}`,
      `${inlineQueryType}:${bankAccount.id}:${row.groupyear}:${row.groupnumber}:${UserTransactionListFilter.NoFilter}`
    ),
    Markup.button.callback(
      formatMoney(row.income, bankAccount.currency),
      `${inlineQueryType}:${bankAccount.id}:${row.groupyear}:${row.groupnumber}:${UserTransactionListFilter.OnlyIncome}`
    ),
    Markup.button.callback(
      formatMoney(row.outcome, bankAccount.currency),
      `${inlineQueryType}:${bankAccount.id}:${row.groupyear}:${row.groupnumber}:${UserTransactionListFilter.OnlyOutcome}`
    ),
  ];
};

export const buildMonthStatistics = (
  statisticRows: UserTransactionExpenseRowItem[],
  bankAccount: { id: string; currency: Currency }
) => {
  return [
    ...statisticRows.map((row) => {
      return buildStatisticGrid(row, 'month', bankAccount);
    }),
    [
      Markup.button.callback(
        '◀️ Back',
        `${BotCallbackQuery.SelectBankAccount}:${bankAccount.id}`
      ),
    ],
  ];
};

export const buildWeekStatistics = (
  statisticRows: UserTransactionExpenseRowItem[],
  bankAccount: BankAccount
) => {
  return [
    ...statisticRows.map((row) => {
      return buildStatisticGrid(row, 'week', bankAccount);
    }),
    [
      Markup.button.callback(
        '◀️ Back',
        `${BotCallbackQuery.SelectBankAccount}:${bankAccount.id}`
      ),
    ],
  ];
};
