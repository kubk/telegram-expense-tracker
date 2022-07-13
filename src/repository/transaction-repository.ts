import {
  Currency,
  Prisma,
  Transaction,
  TransactionSource,
} from '@prisma/client';
import { assert, UnreachableCaseError } from 'ts-essentials';
import {
  calcPaginationOffset,
  CalcPaginationParams,
  createPaginatedResult,
} from '../lib/pagination/pagination';
import { applyImportRules } from '../transaction-import-rules/apply-import-rules';
import { makeTransactionUncountableRule } from '../transaction-import-rules/make-transaction-uncountable-rule';
import { filterTransactionTitleRule } from '../transaction-import-rules/filter-transaction-title';
import { bankAccountGetById } from './bank-account-repository';
import { prisma } from '../db/prisma';

export type UserTransactionExpenseRowItem = {
  outcome: number;
  income: number;
  difference: number;
  groupname: string;
  groupnumber: number;
  groupyear: number;
  currency: Currency | null;
};

export enum TransactionType {
  Expense = 'out',
  TopUp = 'in',
}

export enum UserTransactionListFilter {
  OnlyIncome = 'in',
  OnlyOutcome = 'o',
  NoFilter = 'n',
}

export enum TransactionSortDirection {
  Asc = 'a',
  Desc = 'd',
}

export enum TransactionSortField {
  Date = 'd',
  Amount = 'a',
}

export const transactionsGetGroupedStatistics = async (options: {
  userId: string;
  bankAccountId: string;
}) => {
  const { userId, bankAccountId } = options;

  return prisma.$queryRaw<Array<UserTransactionExpenseRowItem>>`
        with first_transaction_date AS
               (select min(t."createdAt") AS createdAt
                from "Family"
                       left join "User" U
                                 on "Family".id = U."familyId" and U.id = ${userId}
                       left join "BankAccount" BA
                                 on "Family".id = BA."familyId" and
                                    BA.id = ${bankAccountId}
                       left join "Transaction" t
                                 on BA.id = t."bankAccountId" and
                                    t."isCountable" = true),
             months as
               (select month_start,
                       (month_start + interval '1 month' -
                         interval '1 second') as month_end
                from generate_series(date_trunc('month',
                                                (select createdAt from first_transaction_date)),
                                     now(), '1 month') as month_start)
        select sum(case when T.amount < 0 then t.amount else 0 end) as outcome,
               sum(case when T.amount > 0 then t.amount else 0 end) as income,
               coalesce(sum(T.amount), 0)                           as difference,
               ba.currency,
               -- FM removes spaces after text
               to_char(month_start, 'FMMon')                        as groupName,
               extract(year from month_start)                       as groupYear,
               extract(month from month_start)                      as groupNumber
        from "Family"
               left join "User" u
                         on "Family".id = u."familyId" and u.id = ${userId}
               left join "BankAccount" ba on "Family".id = ba."familyId" and
                                             ba.id = ${bankAccountId}
               left join "Transaction" t
                         on ba.id = t."bankAccountId" and t."isCountable" = true
               right join months
                          on t."createdAt" between month_start and month_end
        group by ba.currency, month_start
        order by month_start desc
      `;
};

export const transactionsGetForUser = async (options: {
  userId: string;
  bankAccountShortId: number;
  pagination: CalcPaginationParams;
  filter: {
    dateFrom: Date;
    dateTo: Date;
    transactionType: UserTransactionListFilter;
    sortDirection: TransactionSortDirection;
    sortField: TransactionSortField;
  };
}) => {
  const {
    userId,
    bankAccountShortId,
    pagination,
    filter: { dateFrom, dateTo, transactionType, sortDirection, sortField },
  } = options;
  const { page } = pagination;
  const { offset, perPage } = calcPaginationOffset(pagination);

  const filterTypeSql = (() => {
    switch (transactionType) {
      case UserTransactionListFilter.NoFilter:
        return Prisma.empty;
      case UserTransactionListFilter.OnlyIncome:
        return Prisma.sql`and t.amount > 0`;
      case UserTransactionListFilter.OnlyOutcome:
        return Prisma.sql`and t.amount < 0`;
      default:
        throw new UnreachableCaseError(transactionType);
    }
  })();

  const sortFieldSql = (() => {
    switch (sortField) {
      case TransactionSortField.Amount:
        return Prisma.sql`t."amount"`;
      case TransactionSortField.Date:
        return Prisma.sql`t."createdAt"`;
      default:
        throw new UnreachableCaseError(sortField);
    }
  })();

  const sortDirectionSql = (() => {
    switch (sortDirection) {
      case TransactionSortDirection.Asc:
        return Prisma.sql`asc`;
      case TransactionSortDirection.Desc:
        return Prisma.sql`desc`;
      default:
        throw new UnreachableCaseError(sortDirection);
    }
  })();

  const [countResult, dataResult] = await Promise.all([
    prisma.$queryRaw<Array<{ count: number }>>`
        select count(t.id) as count
        from "Family"
          left join "User" u
        on "Family".id = u."familyId"
          left join "BankAccount" ba on "Family".id = ba."familyId"
          left join "Transaction" t on ba.id = t."bankAccountId"
        where u.id = ${userId}
          and ba."shortId" = ${bankAccountShortId} ${filterTypeSql}
          and t."createdAt" between ${dateFrom}
          and ${dateTo}
      `,
    prisma.$queryRaw<Transaction[]>`
        select t.*
        from "Family"
               left join "User" u on "Family".id = u."familyId"
               left join "BankAccount" ba on "Family".id = ba."familyId"
               left join "Transaction" t on ba.id = t."bankAccountId"
        where u.id = ${userId}
          and ba."shortId" = ${bankAccountShortId} ${filterTypeSql}
          and t."createdAt" between ${dateFrom}
          and ${dateTo}
        order by ${sortFieldSql} ${sortDirectionSql}
        offset ${offset} limit ${perPage}
      `,
  ]);

  return createPaginatedResult({
    items: dataResult,
    totalItemsCount: countResult[0].count,
    perPage: perPage,
    currentPage: page,
  });
};

export const transactionsImport = async (
  bankAccountId: string,
  transactions: Array<{
    amount: number;
    currency: Currency;
    title: string;
    info: string;
    createdAt: Date;
  }>
) => {
  if (transactions.length < 2) {
    throw new Error('Minimum transaction amount is 2');
  }

  const maxTransactionDate = transactions.reduce<Date | null>(
    (maxDate, current) =>
      !maxDate || current.createdAt > maxDate ? current.createdAt : maxDate,
    null
  );

  const minTransactionDate = transactions.reduce<Date | null>(
    (minDate, current) =>
      !minDate || current.createdAt < minDate ? current.createdAt : minDate,
    null
  );

  assert(maxTransactionDate);
  assert(minTransactionDate);

  const bankAccount = await bankAccountGetById(bankAccountId);

  const newTransactions = transactions
    .map((input) => ({
      createdAt: input.createdAt,
      bankAccountId: bankAccountId,
      info: input.info,
      amount: input.amount,
      currency: input.currency,
      source: TransactionSource.IMPORTED,
      title: input.title,
      isCountable: true,
    }))
    .map((transaction) => {
      return applyImportRules(transaction, bankAccount.filters, [
        makeTransactionUncountableRule,
        filterTransactionTitleRule,
      ]);
    });

  const [removeResult, addResult] = await prisma.$transaction([
    prisma.transaction.deleteMany({
      where: {
        bankAccountId,
        source: TransactionSource.IMPORTED,
        createdAt: {
          gte: minTransactionDate,
          lte: maxTransactionDate,
        },
      },
    }),
    prisma.transaction.createMany({
      data: newTransactions,
    }),
  ]);

  return { removed: removeResult.count, added: addResult.count };
};

export const transactionCreateManual = (input: {
  bankAccountId: string;
  amount: number;
  currency: Currency;
  title: string;
}) => {
  return prisma.transaction.create({
    data: {
      createdAt: new Date(),
      bankAccountId: input.bankAccountId,
      info: '',
      amount: input.amount,
      currency: input.currency,
      source: TransactionSource.MANUAL,
      title: input.title,
    },
  });
};

export const transactionGetById = (transactionId: string) => {
  return prisma.transaction.findUnique({
    where: {
      id: transactionId,
    },
  });
};

export const transactionGetByShortId = (shortId: number) => {
  return prisma.transaction.findFirst({
    where: {
      shortId,
    },
  });
};

export const transactionDelete = (transactionId: string) => {
  return prisma.transaction.delete({
    where: {
      id: transactionId,
    },
  });
};

export const transactionToggleCountable = async (
  transactionShortId: number
) => {
  const transaction = await transactionGetByShortId(transactionShortId);
  assert(transaction);

  return prisma.transaction.update({
    where: { id: transaction.id },
    data: { isCountable: !transaction.isCountable },
  });
};

export const transactionToggleType = async (transactionShortId: number) => {
  const transaction = await transactionGetByShortId(transactionShortId);
  assert(transaction);

  return prisma.transaction.update({
    where: { id: transaction.id },
    data: { amount: -1 * transaction.amount },
  });
};
