import { Currency, Transaction, TransactionSource } from '@prisma/client';
import { Markup } from 'telegraf';
import { BotButtons, BotCallbackQuery } from '../bot-action';
import {
  StatisticGroupByType,
  UserTransactionListFilter,
} from '../../repository/transaction-repository';
import { formatMoney } from '../format-money';
import { UnreachableCaseError } from 'ts-essentials';
import { PaginatedResult } from '../../lib/pagination/pagination';
import { boolNarrow } from '../../lib/typescript/bool-narrow';

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

const getTransactionIsCountableIcon = (transaction: Transaction) => {
  return transaction.isCountable ? '' : '👻';
};

const filterTransactionTitle = (title: string) => {
  return title
    .replace(/POS TMSZ /, '')
    .replace(/\d{4,6} \|? ?\d{4,6}$/, '')
    .replace(/^EPOS/, '');
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
    ...transactionsPaginated.items.map((transaction) => {
      const money = formatMoney({
        amount: transaction.amount,
        currency: transaction.currency,
      });
      const icon = getTransactionSourceIcon(transaction.source);
      const isCountable = getTransactionIsCountableIcon(transaction);
      const title = filterTransactionTitle(transaction.title);

      return [
        Markup.button.callback(
          `${money}  ${icon} ${isCountable}  ${title}`,
          `${BotCallbackQuery.TransactionSelect}:${transaction.id}`
        ),
      ];
    }),
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
