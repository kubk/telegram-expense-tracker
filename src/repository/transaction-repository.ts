import {
  Currency,
  Prisma,
  PrismaClient,
  Transaction,
  TransactionSource,
} from '@prisma/client';
import {
  calcPaginationOffset,
  Pagination,
} from '../utils/calc-pagination-offset';
import { DateTime } from 'luxon';
import { v4 } from 'uuid';
import { assert, UnreachableCaseError } from 'ts-essentials';

export type UserTransactionExpenseRowItem = {
  outcome: number;
  income: number;
  difference: number;
  groupname: string;
  currency: Currency | null;
};

export class TransactionRepository {
  constructor(private prisma: PrismaClient) {}

  getUserTransactionList(options: {
    userId: string;
    bankAccountId: string;
    pagination: Pagination;
  }) {
    const { userId, bankAccountId, pagination } = options;
    const { offset, perPage } = calcPaginationOffset(pagination);

    return this.prisma.$queryRaw<Transaction[]>`
      select t.*
      from "Family"
             left join "User" u on "Family".id = u."familyId"
             left join "BankAccount" ba on "Family".id = ba."familyId"
             left join "Transaction" t on ba.id = t."bankAccountId"
      where u.id = ${userId}
        and ba.id = ${bankAccountId}
      order by t."createdAt" desc
      offset ${offset} limit ${perPage}
    `;
  }

  async getUserTransactionsExpenses(options: {
    userId: string;
    bankAccountId: string;
    type: 'weekly' | 'monthly';
  }) {
    const { userId, bankAccountId, type } = options;

    if (type === 'weekly') {
      return this.prisma.$queryRaw<Array<UserTransactionExpenseRowItem>>`
        WITH first_transaction_date AS
               (SELECT min(t."createdAt") AS createdAt
                FROM "Family"
                       LEFT JOIN "User" U
                                 ON "Family".id = U."familyId" AND U.id = ${userId}
                       LEFT JOIN "BankAccount" BA
                                 ON "Family".id = BA."familyId" AND
                                    BA.id = ${bankAccountId}
                       LEFT JOIN "Transaction" T ON BA.id = T."bankAccountId"),
             weeks AS
               (SELECT week_start,
                       (week_start + INTERVAL '1 week' -
                        INTERVAL '1 second') AS week_end
                FROM generate_series(date_trunc('week',
                                                (SELECT createdAt FROM first_transaction_date)),
                                     now(), '1 week') AS week_start)
        SELECT sum(case when T.amount < 0 then t.amount else 0 end) as outcome,
               sum(case when T.amount > 0 then t.amount else 0 end) as income,
               coalesce(sum(T.amount), 0)                           as difference,
               ba.currency,
               DATE_PART('week', week_start)::text                  as groupName
        FROM "Family"
               LEFT JOIN "User" u
                         ON "Family".id = u."familyId" AND u.id = ${userId}
               LEFT JOIN "BankAccount" ba ON "Family".id = ba."familyId" AND
                                             ba.id = ${bankAccountId}
               LEFT JOIN "Transaction" t ON ba.id = t."bankAccountId"
               RIGHT JOIN weeks ON t."createdAt" BETWEEN week_start AND week_end
        GROUP BY ba.currency, week_start
        ORDER BY week_start DESC
      `;
    }

    if (type === 'monthly') {
      return this.prisma.$queryRaw<Array<UserTransactionExpenseRowItem>>`
        WITH first_transaction_date AS
               (SELECT min(t."createdAt") AS createdAt
                FROM "Family"
                       LEFT JOIN "User" U
                                 ON "Family".id = U."familyId" AND U.id = ${userId}
                       LEFT JOIN "BankAccount" BA
                                 ON "Family".id = BA."familyId" AND
                                    BA.id = ${bankAccountId}
                       LEFT JOIN "Transaction" T ON BA.id = T."bankAccountId"),
             months as
               (select month_start,
                       (month_start + INTERVAL '1 month' -
                        INTERVAL '1 second') as month_end
                from generate_series(date_trunc('month',
                                                (SELECT createdAt FROM first_transaction_date)),
                                     now(), '1 month') as month_start)
        SELECT sum(case when T.amount < 0 then t.amount else 0 end) as outcome,
               sum(case when T.amount > 0 then t.amount else 0 end) as income,
               coalesce(sum(T.amount), 0)                           as difference,
               ba.currency,
--                FM removes spaces after text
               TO_CHAR(month_start, 'FMMon')                        as groupName
        FROM "Family"
               LEFT JOIN "User" u
                         ON "Family".id = u."familyId" AND u.id = ${userId}
               LEFT JOIN "BankAccount" ba ON "Family".id = ba."familyId" AND
                                             ba.id = ${bankAccountId}
               LEFT JOIN "Transaction" t ON ba.id = t."bankAccountId"
               RIGHT JOIN months
                          ON t."createdAt" BETWEEN month_start AND month_end
        GROUP BY ba.currency, month_start
        ORDER BY month_start DESC
      `;
    }

    throw new UnreachableCaseError(type);
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
}
