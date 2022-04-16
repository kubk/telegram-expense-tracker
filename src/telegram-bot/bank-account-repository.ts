import { BankAccount, PrismaClient } from '@prisma/client';

export class BankAccountRepository {
  constructor(private prisma: PrismaClient) {}

  getUserBankAccounts(userId: string) {
    return this.prisma.$queryRaw<BankAccount[]>`
select ba.*
from "Family"
left join "User" u on "Family".id = u."familyId"
left join "BankAccount" ba on "Family".id = ba."familyId"
where u.id = ${userId}
`;
  }
}
