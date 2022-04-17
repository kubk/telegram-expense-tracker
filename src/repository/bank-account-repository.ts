import { BankAccount, Currency, PrismaClient } from '@prisma/client';

export class BankAccountRepository {
  constructor(private prisma: PrismaClient) {}

  async getUserBankAccounts(userId: string) {
    const result = await this.prisma.$queryRaw<BankAccount[]>`
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
    return this.prisma.bankAccount.findFirst({
      where: {
        id: bankAccountId,
      },
    });
  }

  createBankAccount(input: {
    name: string;
    currency: Currency;
    familyId: string;
  }) {
    return this.prisma.bankAccount.create({
      data: {
        currency: input.currency,
        name: input.name,
        familyId: input.familyId,
      },
    });
  }
}
