import {
  BankAccount,
  Currency,
  Transaction,
  TransactionSource,
} from '@prisma/client';
import { Markup } from 'telegraf';
import { BotButtons, BotCallbackQuery } from './bot-action';
import {
  StatisticGroupByType,
  type UserTransactionExpenseRowItem,
  UserTransactionListFilter,
} from '../repository/transaction-repository';
import { formatMoney } from './format-money';
import { UnreachableCaseError } from 'ts-essentials';
import { PaginatedResult } from '../lib/pagination/pagination';
import { boolNarrow } from '../lib/typescript/bool-narrow';

const buildStatisticGrid = (
  row: UserTransactionExpenseRowItem,
  type: StatisticGroupByType,
  bankAccount: { id: string; currency: Currency }
) => {
  return [
    Markup.button.callback(
      `${row.groupname} ${formatMoney(
        row.difference,
        bankAccount.currency
      ).padStart(10, ' ')}`,
      `${type}:${bankAccount.id}:${row.groupyear}:${row.groupnumber}:${UserTransactionListFilter.NoFilter}:1`
    ),
    Markup.button.callback(
      formatMoney(row.income, bankAccount.currency),
      `${type}:${bankAccount.id}:${row.groupyear}:${row.groupnumber}:${UserTransactionListFilter.OnlyIncome}:1`
    ),
    Markup.button.callback(
      formatMoney(row.outcome, bankAccount.currency),
      `${type}:${bankAccount.id}:${row.groupyear}:${row.groupnumber}:${UserTransactionListFilter.OnlyOutcome}:1`
    ),
  ];
};

export const buildMonthStatistics = (
  statisticRows: UserTransactionExpenseRowItem[],
  bankAccount: { id: string; currency: Currency }
) => {
  return [
    ...statisticRows.map((row) => {
      return buildStatisticGrid(row, StatisticGroupByType.Month, bankAccount);
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
      return buildStatisticGrid(row, StatisticGroupByType.Week, bankAccount);
    }),
    [
      Markup.button.callback(
        '◀️ Back',
        `${BotCallbackQuery.SelectBankAccount}:${bankAccount.id}`
      ),
    ],
  ];
};

const getTransactionSourceIcon = (transactionSource: TransactionSource) => {
  switch (transactionSource) {
    case TransactionSource.IMPORTED:
      return '💳';
    case TransactionSource.MANUAL:
      return '⌨️';
    default:
      throw new UnreachableCaseError(transactionSource);
  }
};

const filterTransactionTitle = (title: string) => {
  return title.replace(/POS TMSZ /, '').replace(/\d{4,6} \|? ?\d{4,6}$/, '');
};

const getBackButtonInlineQuery = (type: StatisticGroupByType) => {
  switch (type) {
    case StatisticGroupByType.Month:
      return BotButtons.StatisticMonthsButton;
    case StatisticGroupByType.Week:
      return BotButtons.StatisticWeeksButton;
    default:
      throw new UnreachableCaseError(type);
  }
};

const getBackButtonTitle = (type: StatisticGroupByType) => {
  switch (type) {
    case StatisticGroupByType.Month:
      return '◀️ Back to monthly statistics';
    case StatisticGroupByType.Week:
      return '◀️ Back to weekly statistics';
    default:
      throw new UnreachableCaseError(type);
  }
};

export const buildTransactionPaginatedResult = (options: {
  transactionsPaginated: PaginatedResult<Transaction>;
  type: StatisticGroupByType;
  bankAccount: { id: string; currency: Currency };
  groupYear: number;
  groupNumber: number;
  filter: UserTransactionListFilter;
}) => {
  const {
    transactionsPaginated,
    type,
    bankAccount,
    groupNumber,
    groupYear,
    filter,
  } = options;

  const backButtonInlineQuery = getBackButtonInlineQuery(type);
  const backButtonTitle = getBackButtonTitle(type);

  return [
    ...transactionsPaginated.items.map((item) => [
      Markup.button.callback(
        `${formatMoney(item.amount, item.currency)}  ${getTransactionSourceIcon(
          item.source
        )}  ${filterTransactionTitle(item.title)}`,
        `${BotCallbackQuery.TransactionSelect}:${item.id}`
      ),
    ]),
    [
      transactionsPaginated.previousPage !== null
        ? Markup.button.callback(
            `← Page ${transactionsPaginated.previousPage} / ${transactionsPaginated.totalPages}`,
            `${type}:${bankAccount.id}:${groupYear}:${groupNumber}:${filter}:${transactionsPaginated.previousPage}`
          )
        : null,
      transactionsPaginated.nextPage !== null
        ? Markup.button.callback(
            `Page ${transactionsPaginated.nextPage} / ${transactionsPaginated.totalPages} →`,
            `${type}:${bankAccount.id}:${groupYear}:${groupNumber}:${filter}:${transactionsPaginated.nextPage}`
          )
        : null,
    ].filter(boolNarrow),
    [
      Markup.button.callback(
        backButtonTitle,
        `${backButtonInlineQuery}:${bankAccount.id}`
      ),
    ],
  ];
};
