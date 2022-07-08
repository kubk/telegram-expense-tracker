import { TransactionImportRule } from '@prisma/client';

export type Transaction = {
  title: string;
  isCountable: boolean;
};

export type ApplyImportRule<T extends Transaction> = (
  transaction: T,
  rules: TransactionImportRule[]
) => T;

export const applyImportRules = <T extends Transaction>(
  transaction: T,
  importRules: TransactionImportRule[],
  appliers: ApplyImportRule<T>[]
) => {
  return appliers.reduce(
    (transaction, apply) => apply(transaction, importRules),
    transaction
  );
};
