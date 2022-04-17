import { PrismaClient } from '@prisma/client';
import { UserRepository } from './repository/user-repository';
import { FamilyRepository } from './repository/family-repository';
import { BankAccountRepository } from './repository/bank-account-repository';
import { TransactionRepository } from './repository/transaction-repository';

export const config = {
  debug: false,
  pagination: {
    perPage: 10,
  },
};

export const prisma = new PrismaClient({
  log: config.debug ? ['query', 'info', 'warn', 'error'] : undefined,
});
export const userRepository = new UserRepository(prisma);
export const familyRepository = new FamilyRepository(prisma);
export const bankRepository = new BankAccountRepository(prisma);
export const transactionRepository = new TransactionRepository(prisma);
