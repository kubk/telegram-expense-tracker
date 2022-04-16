import {
  Currency,
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
where u.id = ${userId} and ba.id = ${bankAccountId}
order by t."createdAt" desc
offset ${offset} limit ${perPage}
    `;
  }

  async getUserTransactionsExpenses(options: {
    userId: string;
    bankAccountId: string;
    dateFrom: DateTime;
    dateTo: DateTime;
  }) {
    const { userId, bankAccountId, dateFrom, dateTo } = options;

    const rows = await this.prisma.$queryRaw<
      Array<{
        outcome: number;
        income: number;
        difference: number;
      }>
    >`
select
  sum(case when T.amount < 0 then t.amount else 0 end) as outcome,
  sum(case when T.amount > 0 then t.amount else 0 end) as income,
  sum(T.amount) as difference,
  ba.currency
from "Family"
left join "User" u on "Family".id = u."familyId"
left join "BankAccount" ba on "Family".id = ba."familyId"
left join "Transaction" t on ba.id = t."bankAccountId"
where u.id = ${userId} and ba.id = ${bankAccountId}
and t."createdAt" between ${dateFrom.toJSDate()} and ${dateTo.toJSDate()}
group by ba.currency
    `;

    if (rows.length !== 1) {
      throw new Error(
        `Unexpected row count in getUserTransactionsExpenses: ${rows.length}`
      );
    }

    return rows[0];
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
}
