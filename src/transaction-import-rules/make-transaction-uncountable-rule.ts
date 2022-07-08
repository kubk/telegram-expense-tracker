import {
  TransactionImportRule,
  TransactionImportRuleType,
} from '@prisma/client';
import { Transaction } from './apply-import-rules';

export const makeTransactionUncountableRule = <T extends Transaction>(
  transaction: T,
  filters: TransactionImportRule[]
) => {
  const newTitle = filters
    .filter((filter) => {
      return filter.type === TransactionImportRuleType.MakeUncountable;
    })
    .some((filter) => {
      return new RegExp(filter.name).test(transaction.title);
    });

  return newTitle ? { ...transaction, isCountable: false } : transaction;
};
