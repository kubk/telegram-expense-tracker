import { BankAccount, Transaction, TransactionSource } from '@prisma/client';
import { Markup } from 'telegraf';
import { BotButtons, BotCallbackQuery } from '../bot-action';
import {
  FilterTransactionIsCountable,
  FilterTransactionSource,
  TransactionSortDirection,
  TransactionSortField,
} from '../../repository/transaction-repository';
import { formatMoney } from '../format-money';
import { UnreachableCaseError } from 'ts-essentials';
import { PaginatedResult } from '../../lib/pagination/pagination';
import { boolNarrow } from '../../lib/typescript/bool-narrow';
import {
  FilterTransactionState,
  generateTransactionListLink,
  TransactionFilters,
} from './generate-transaction-list-link';

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

const getAppliedFiltersCount = (filters: TransactionFilters) => {
  let count = 0;
  if (filters.filterCountable !== FilterTransactionIsCountable.All) {
    count++;
  }
  if (filters.filterSource !== FilterTransactionSource.All) {
    count++;
  }
  return count;
};

export const buildTransactionPaginatedResult = (options: {
  transactionsPaginated: PaginatedResult<Transaction>;
  bankAccount: Pick<BankAccount, 'id' | 'shortId' | 'currency'>;
  groupYear: number;
  groupNumber: number;
  filters: TransactionFilters;
  sortDirection: TransactionSortDirection;
  sortField: TransactionSortField;
}) => {
  const {
    transactionsPaginated,
    bankAccount,
    groupNumber,
    groupYear,
    filters,
    sortDirection,
    sortField,
  } = options;

  const bankAccountShortId = bankAccount.shortId;

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
    sortButtons
      .map(({ text, field, defaultDirection }) =>
        Markup.button.callback(
          `${text} ${sortField === field ? getSortIcon(sortDirection) : ''}️`,
          generateTransactionListLink({
            bankAccountShortId,
            groupYear,
            groupNumber,
            filters,
            sortField: field,
            sortDirection:
              sortField === field
                ? getOppositeDirection(sortDirection)
                : defaultDirection,
            page: 1,
          })
        )
      )
      .concat(
        Markup.button.callback(
          `Filters (${getAppliedFiltersCount(filters)})`,
          generateTransactionListLink({
            bankAccountShortId,
            groupYear,
            groupNumber,
            filters: {
              ...filters,
              filterState: FilterTransactionState.Changing,
            },
            sortField,
            sortDirection,
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
            bankAccountShortId: bankAccountShortId,
            groupYear,
            groupNumber,
            filters,
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
              bankAccountShortId: bankAccountShortId,
              groupYear,
              groupNumber,
              filters,
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
              bankAccountShortId: bankAccountShortId,
              groupYear,
              groupNumber,
              filters,
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
