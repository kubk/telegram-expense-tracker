import {
  StatisticGroupByType,
  UserTransactionExpenseRowItem,
  UserTransactionListFilter,
} from '../../repository/transaction-repository';
import { Currency } from '@prisma/client';
import { Markup } from 'telegraf';
import { formatMoney } from '../format-money';

export const buildStatisticGridMenu = (
  row: UserTransactionExpenseRowItem,
  type: StatisticGroupByType,
  bankAccount: { id: string; currency: Currency },
  page: number
) => {
  return [
    Markup.button.callback(
      `${row.groupname} ${formatMoney(
        row.difference,
        bankAccount.currency
      ).padStart(5, ' ')}`,
      `${type}:${bankAccount.id}:${row.groupyear}:${row.groupnumber}:${UserTransactionListFilter.NoFilter}:${page}`
    ),
    Markup.button.callback(
      formatMoney(row.income, bankAccount.currency),
      `${type}:${bankAccount.id}:${row.groupyear}:${row.groupnumber}:${UserTransactionListFilter.OnlyIncome}:${page}`
    ),
    Markup.button.callback(
      formatMoney(row.outcome, bankAccount.currency),
      `${type}:${bankAccount.id}:${row.groupyear}:${row.groupnumber}:${UserTransactionListFilter.OnlyOutcome}:${page}`
    ),
  ];
};
