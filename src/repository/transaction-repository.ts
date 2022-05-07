import {
  Currency,
  Prisma,
  PrismaClient,
  Transaction,
  TransactionSource,
} from '@prisma/client';
import { assert, UnreachableCaseError } from 'ts-essentials';
import {
  calcPaginationOffset,
  CalcPaginationParams,
  createPaginatedResult,
} from '../lib/pagination/pagination';

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
  OnlyOutcome = 'out',
  NoFilter = 'no',
}

export enum StatisticGroupByType {
  Month = 'm',
  Week = 'w',
}

export class TransactionRepository {
  constructor(private prisma: PrismaClient) {}

  async getUserTransactionsExpensesGrouped(options: {
    userId: string;
    bankAccountId: string;
    type: StatisticGroupByType;
  }) {
    const { userId, bankAccountId, type } = options;

    if (type === StatisticGroupByType.Week) {
      return this.prisma.$queryRaw<Array<UserTransactionExpenseRowItem>>`
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
             weeks AS
               (select week_start,
                       (week_start + interval '1 week' -
                         interval '1 second') AS week_end
                from generate_series(date_trunc('week',
                                                (select createdAt from first_transaction_date)),
                                     now(), '1 week') AS week_start)
        select sum(case when T.amount < 0 then t.amount else 0 end) as outcome,
               sum(case when T.amount > 0 then t.amount else 0 end) as income,
               coalesce(sum(T.amount), 0)                           as difference,
               ba.currency,
               extract(year from week_start)                        as groupYear,
               date_part('week', week_start)                        as groupNumber,
               'W.' || date_part('week', week_start) ::text     as groupName
        from "Family"
               left join "User" u
                         on "Family".id = u."familyId" and u.id = ${userId}
               left join "BankAccount" ba on "Family".id = ba."familyId" and
                                             ba.id = ${bankAccountId}
               left join "Transaction" t
                         on ba.id = t."bankAccountId" and t."isCountable" = true
               right join weeks on t."createdAt" between week_start and week_end
        group by ba.currency, week_start
        order by week_start desc
      `;
    }

    if (type === StatisticGroupByType.Month) {
      return this.prisma.$queryRaw<Array<UserTransactionExpenseRowItem>>`
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
    }

    throw new UnreachableCaseError(type);
  }

  async getUserTransactionList(options: {
    userId: string;
    bankAccountId: string;
    pagination: CalcPaginationParams;
    filter: {
      dateFrom: Date;
      dateTo: Date;
      transactionType: UserTransactionListFilter;
    };
  }) {
    const {
      userId,
      bankAccountId,
      pagination,
      filter: { dateFrom, dateTo, transactionType },
    } = options;
    const { page } = pagination;
    const { offset, perPage } = calcPaginationOffset(pagination);

    const transactionTypeFilter = (() => {
      switch (transactionType) {
        case UserTransactionListFilter.NoFilter:
          return Prisma.empty;
        case UserTransactionListFilter.OnlyIncome:
          return Prisma.sql`AND t.amount > 0`;
        case UserTransactionListFilter.OnlyOutcome:
          return Prisma.sql`AND t.amount < 0`;
        default:
          throw new UnreachableCaseError(transactionType);
      }
    })();

    const [countResult, dataResult] = await Promise.all([
      this.prisma.$queryRaw<Array<{ count: number }>>`
        select count(t.id) as count
        from "Family"
          left join "User" u
        on "Family".id = u."familyId"
          left join "BankAccount" ba on "Family".id = ba."familyId"
          left join "Transaction" t on ba.id = t."bankAccountId"
        where u.id = ${userId}
          and ba.id = ${bankAccountId} ${transactionTypeFilter}
          and t."createdAt" between ${dateFrom}
          and ${dateTo}
      `,
      this.prisma.$queryRaw<Transaction[]>`
        select t.*
        from "Family"
               left join "User" u on "Family".id = u."familyId"
               left join "BankAccount" ba on "Family".id = ba."familyId"
               left join "Transaction" t on ba.id = t."bankAccountId"
        where u.id = ${userId}
          and ba.id = ${bankAccountId} ${transactionTypeFilter}
          and t."createdAt" between ${dateFrom}
          and ${dateTo}
        order by t."createdAt" desc
        offset ${offset} limit ${perPage}
      `,
    ]);

    return createPaginatedResult({
      items: dataResult,
      totalItemsCount: countResult[0].count,
      perPage: perPage,
      currentPage: page,
    });
  }

  createManualTransaction(input: {
    bankAccountId: string;
    amount: number;
    currency: Currency;
    title: string;
  }) {
    return this.prisma.transaction.create({
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
  }

  async importTransactions(
    bankAccountId: string,
    transactions: Array<{
      bankAccountId: string;
      amount: number;
      currency: Currency;
      title: string;
      info: string;
      createdAt: Date;
    }>
  ) {
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

    const [removeResult, addResult] = await this.prisma.$transaction([
      this.prisma.transaction.deleteMany({
        where: {
          bankAccountId,
          source: TransactionSource.IMPORTED,
          createdAt: {
            gte: minTransactionDate,
            lte: maxTransactionDate,
          },
        },
      }),
      this.prisma.transaction.createMany({
        data: transactions.map((input) => ({
          createdAt: input.createdAt,
          bankAccountId: input.bankAccountId,
          info: input.info,
          amount: input.amount,
          currency: input.currency,
          source: TransactionSource.IMPORTED,
          title: input.title,
        })),
      }),
    ]);

    return { removed: removeResult.count, added: addResult.count };
  }

  async getTransaction(transactionId: string) {
    return this.prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });
  }

  deleteTransaction(transactionId: string) {
    return this.prisma.transaction.delete({
      where: {
        id: transactionId,
      },
    });
  }

  async toggleTransactionCountable(transactionId: string) {
    const transaction = await this.getTransaction(transactionId);
    assert(transaction);

    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: { isCountable: !transaction.isCountable },
    });
  }
}
