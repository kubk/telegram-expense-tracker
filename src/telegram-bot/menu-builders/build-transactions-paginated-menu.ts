import { BankAccount, Transaction, TransactionSource } from '@prisma/client';
import { Markup } from 'telegraf';
import { BotButtons, BotCallbackQuery } from '../bot-action';
import {
  TransactionSortDirection,
  TransactionSortField,
  UserTransactionListFilter,
} from '../../repository/transaction-repository';
import { formatMoney } from '../format-money';
import { UnreachableCaseError } from 'ts-essentials';
import { PaginatedResult } from '../../lib/pagination/pagination';
import { boolNarrow } from '../../lib/typescript/bool-narrow';
import { generateTransactionListLink } from './generate-transaction-list-link';

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

const getSortIcon = (direction: TransactionSortDirection) => {
  switch (direction) {
    case TransactionSortDirection.Desc:
      return '🔽';
    case TransactionSortDirection.Asc:
      return '🔼';
    default:
      throw new UnreachableCaseError(direction);
  }
};

const getOppositeDirection = (direction: TransactionSortDirection) => {
  switch (direction) {
    case TransactionSortDirection.Desc:
      return TransactionSortDirection.Asc;
    case TransactionSortDirection.Asc:
      return TransactionSortDirection.Desc;
    default:
      throw new UnreachableCaseError(direction);
  }
};

export const buildTransactionPaginatedResult = (options: {
  transactionsPaginated: PaginatedResult<Transaction>;
  bankAccount: Pick<BankAccount, 'id' | 'shortId' | 'currency'>;
  groupYear: number;
  groupNumber: number;
  filter: UserTransactionListFilter;
  sortDirection: TransactionSortDirection;
  sortField: TransactionSortField;
}) => {
  const {
    transactionsPaginated,
    bankAccount,
    groupNumber,
    groupYear,
    filter,
    sortDirection,
    sortField,
  } = options;

  const bankAccountIdShortened = bankAccount.shortId;

  const sortButtons = [
    {
      text: 'Date',
      field: TransactionSortField.Date,
      defaultDirection: TransactionSortDirection.Desc,
    },
    {
      text: 'Amount',
      field: TransactionSortField.Amount,
      defaultDirection: TransactionSortDirection.Asc,
    },
  ];

  return [
    sortButtons.map(({ text, field, defaultDirection }) =>
      Markup.button.callback(
        `${text} ${sortField === field ? getSortIcon(sortDirection) : ''}️`,
        generateTransactionListLink({
          bankAccountShortId: bankAccountIdShortened,
          groupYear,
          groupNumber,
          filter,
          sortField: field,
          sortDirection:
            sortField === field
              ? getOppositeDirection(sortDirection)
              : defaultDirection,
          page: 1,
        })
      )
    ),
    ...transactionsPaginated.items.map((transaction) => {
      const money = formatMoney({
        amount: transaction.amount,
        currency: transaction.currency,
      });
      const icon = getTransactionSourceIcon(transaction.source);
      const isCountable = getTransactionIsCountableIcon(transaction);
      const title = transaction.title;

      return [
        Markup.button.callback(
          `${money}  ${icon} ${isCountable}  ${title}`,
          `${BotCallbackQuery.TransactionSelect}:${
            transaction.shortId
          }:${generateTransactionListLink({
            bankAccountShortId: bankAccountIdShortened,
            groupYear,
            groupNumber,
            filter,
            sortField,
            sortDirection,
            page: transactionsPaginated.currentPage,
          })}`
        ),
      ];
    }),
    [
      transactionsPaginated.previousPage !== null
        ? Markup.button.callback(
            `← Page ${transactionsPaginated.previousPage} / ${transactionsPaginated.totalPages}`,
            generateTransactionListLink({
              bankAccountShortId: bankAccountIdShortened,
              groupYear,
              groupNumber,
              filter,
              sortField,
              sortDirection,
              page: transactionsPaginated.previousPage,
            })
          )
        : null,
      transactionsPaginated.nextPage !== null
        ? Markup.button.callback(
            `Page ${transactionsPaginated.nextPage} / ${transactionsPaginated.totalPages} →`,
            generateTransactionListLink({
              bankAccountShortId: bankAccountIdShortened,
              groupYear,
              groupNumber,
              filter,
              sortField,
              sortDirection,
              page: transactionsPaginated.nextPage,
            })
          )
        : null,
    ].filter(boolNarrow),
    [
      Markup.button.callback(
        `◀️ Back to monthly statistics`,
        `${BotButtons.StatisticMonthsButton}:${bankAccount.shortId}`
      ),
    ],
  ];
};
