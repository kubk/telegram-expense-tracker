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
  const money = formatMoney({
    amount: row.difference,
    currency: bankAccount.currency,
  }).padStart(3, ' ');

  return [
    Markup.button.callback(
      `${row.groupname} ${money}`,
      `${type}:${bankAccount.id}:${row.groupyear}:${row.groupnumber}:${UserTransactionListFilter.NoFilter}:${page}`
    ),
    Markup.button.callback(
      formatMoney({ amount: row.income, currency: bankAccount.currency }),
      `${type}:${bankAccount.id}:${row.groupyear}:${row.groupnumber}:${UserTransactionListFilter.OnlyIncome}:${page}`
    ),
    Markup.button.callback(
      formatMoney({ amount: row.outcome, currency: bankAccount.currency }),
      `${type}:${bankAccount.id}:${row.groupyear}:${row.groupnumber}:${UserTransactionListFilter.OnlyOutcome}:${page}`
    ),
  ];
};
