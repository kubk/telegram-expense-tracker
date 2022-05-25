import {
  StatisticGroupByType,
  TransactionSortDirection,
  TransactionSortField,
  UserTransactionExpenseRowItem,
  UserTransactionListFilter,
} from '../../repository/transaction-repository';
import { Currency } from '@prisma/client';
import { Markup } from 'telegraf';
import { formatMoney } from '../format-money';
import { generateTransactionListLink } from './generate-transaction-list-link';

export const buildStatisticGridMenu = (
  row: UserTransactionExpenseRowItem,
  type: StatisticGroupByType,
  bankAccount: { id: string; currency: Currency },
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
        type,
        bankAccountId: bankAccount.id,
        groupYear: row.groupyear,
        groupNumber: row.groupnumber,
        filter: UserTransactionListFilter.NoFilter,
        sortField: TransactionSortField.Date,
        sortDirection: TransactionSortDirection.Desc,
        page,
      })
    ),
    Markup.button.callback(
      formatMoney({ amount: row.income, currency: bankAccount.currency }),
      generateTransactionListLink({
        type,
        bankAccountId: bankAccount.id,
        groupYear: row.groupyear,
        groupNumber: row.groupnumber,
        filter: UserTransactionListFilter.OnlyIncome,
        sortField: TransactionSortField.Date,
        sortDirection: TransactionSortDirection.Desc,
        page,
      })
    ),
    Markup.button.callback(
      formatMoney({ amount: row.outcome, currency: bankAccount.currency }),
      generateTransactionListLink({
        type,
        bankAccountId: bankAccount.id,
        groupYear: row.groupyear,
        groupNumber: row.groupnumber,
        filter: UserTransactionListFilter.OnlyOutcome,
        sortField: TransactionSortField.Date,
        sortDirection: TransactionSortDirection.Desc,
        page,
      })
    ),
  ];
};
