import {
  TransactionImportRule,
  TransactionImportRuleType,
} from '@prisma/client';
import { Transaction } from './apply-import-rules';

export const filterTransactionTitleRule = <T extends Transaction>(
  transaction: T,
  filters: TransactionImportRule[]
) => {
  const newTitle = filters
    .filter((filter) => {
      return filter.type === TransactionImportRuleType.FilterTransactionName;
    })
    .reduce((accumulator, current) => {
      return accumulator.replace(new RegExp(current.name), '');
    }, transaction.title);

  return {
    ...transaction,
    title: newTitle,
  };
};
