import {
  BankAccount,
  Currency,
  Prisma,
  TransactionSource,
} from '@prisma/client';
import { prisma } from '../container';
import { TransactionType } from './transaction-repository';
import { assert, UnreachableCaseError } from 'ts-essentials';

const getTransactionTypeFilter = (transactionType: TransactionType) => {
  switch (transactionType) {
    case TransactionType.TopUp:
      return Prisma.sql`t.amount > 0`;
    case TransactionType.Expense:
      return Prisma.sql`t.amount < 0`;
    default:
      throw new UnreachableCaseError(transactionType);
  }
};

export class BankAccountRepository {
  async getMostUsedTransactionTitles(
    bankAccountId: string,
    transactionType: TransactionType
  ) {
    return prisma.$queryRaw<Array<{ title: string }>>`
      select t.title
      from "Transaction" t
      where t.source = ${TransactionSource.MANUAL}
          and t."bankAccountId" = ${bankAccountId}
          and ${getTransactionTypeFilter(transactionType)}
      group by t.title
      order by count(*) desc
      limit 15
    `;
  }

  async getUserBankAccounts(userId: string) {
    const result = await prisma.$queryRaw<BankAccount[]>`
      select ba.*
      from "Family"
             left join "User" u on "Family".id = u."familyId"
             left join "BankAccount" ba on "Family".id = ba."familyId"
      where u.id = ${userId}
    `;

    // Why does prisma return 1 empty row when there are no results?
    if (result.length === 1 && result[0].id === null) {
      return [];
    }

    return result;
  }

  getBankAccountById(bankAccountId: string) {
    return prisma.bankAccount.findFirst({
      where: {
        id: bankAccountId,
      },
    });
  }

  async getBankAccountByShortId(bankAccountShortId: number) {
    const result = await prisma.bankAccount.findFirst({
      where: {
        shortId: bankAccountShortId,
      },
    });
    assert(result);
    return result;
  }

  createBankAccount(input: {
    name: string;
    currency: Currency;
    familyId: string;
  }) {
    return prisma.bankAccount.create({
      data: {
        currency: input.currency,
        name: input.name,
        familyId: input.familyId,
      },
    });
  }
}
