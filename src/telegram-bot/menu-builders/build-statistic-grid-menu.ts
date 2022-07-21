import {
  FilterTransactionIsCountable,
  FilterTransactionSource,
  TransactionSortDirection,
  TransactionSortField,
  UserTransactionExpenseRowItem,
  UserTransactionListFilter,
} from '../../repository/transaction-repository';
import { BankAccount } from '@prisma/client';
import { Markup } from 'telegraf';
import { formatMoney } from '../format-money';
import {
  FilterTransactionState,
  generateTransactionListLink,
} from './generate-transaction-list-link';

const getDefaultFilters = (transactionType: UserTransactionListFilter) => {
  return {
    transactionType,
    filterCountable: FilterTransactionIsCountable.All,
    filterSource: FilterTransactionSource.All,
    filterState: FilterTransactionState.Applied,
  };
};

export const buildStatisticGridMenu = (
  row: UserTransactionExpenseRowItem,
  bankAccount: Pick<BankAccount, 'currency' | 'shortId'>,
  page: number
) => {
  const money = formatMoney({
    amount: row.difference,
    currency: bankAccount.currency,
  }).padStart(3, ' ');

  return [
    Markup.button.callback(
      `${row.groupname} ${money}`,
      generateTransactionListLink({
        bankAccountShortId: bankAccount.shortId,
        groupYear: row.groupyear,
        groupNumber: row.groupnumber,
        filters: getDefaultFilters(UserTransactionListFilter.NoFilter),
        sortField: TransactionSortField.Date,
        sortDirection: TransactionSortDirection.Desc,
        page,
      })
    ),
    Markup.button.callback(
      formatMoney({ amount: row.income, currency: bankAccount.currency }),
      generateTransactionListLink({
        bankAccountShortId: bankAccount.shortId,
        groupYear: row.groupyear,
        groupNumber: row.groupnumber,
        filters: getDefaultFilters(UserTransactionListFilter.OnlyIncome),
        sortField: TransactionSortField.Date,
        sortDirection: TransactionSortDirection.Desc,
        page,
      })
    ),
    Markup.button.callback(
      formatMoney({ amount: row.outcome, currency: bankAccount.currency }),
      generateTransactionListLink({
        bankAccountShortId: bankAccount.shortId,
        groupYear: row.groupyear,
        groupNumber: row.groupnumber,
        filters: getDefaultFilters(UserTransactionListFilter.OnlyOutcome),
        sortField: TransactionSortField.Date,
        sortDirection: TransactionSortDirection.Desc,
        page,
      })
    ),
  ];
};
