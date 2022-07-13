import {
  BankAccount,
  Currency,
  Prisma,
  TransactionSource,
} from '@prisma/client';
import { TransactionType } from './transaction-repository';
import { assert, UnreachableCaseError } from 'ts-essentials';
import { prisma } from '../db/prisma';

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

export const bankAccountGetById = async (bankAccountId: string) => {
  const bankAccount = await prisma.bankAccount.findFirst({
    where: {
      id: bankAccountId,
    },
    include: {
      filters: true,
    },
  });

  assert(bankAccount);

  return bankAccount;
};

export const bankAccountGetMostUsedTransactionTitles = async (
  bankAccountId: string,
  transactionType: TransactionType
) => {
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
};

export const bankAccountCreate = (input: {
  name: string;
  currency: Currency;
  familyId: string;
}) => {
  return prisma.bankAccount.create({
    data: {
      currency: input.currency,
      name: input.name,
      familyId: input.familyId,
    },
  });
};

export const bankAccountGetByShortId = async (bankAccountShortId: number) => {
  const result = await prisma.bankAccount.findFirst({
    where: {
      shortId: bankAccountShortId,
    },
    include: {
      filters: true,
    },
  });
  assert(result);
  return result;
};

export const bankAccountGetForUser = async (userId: string) => {
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
};
