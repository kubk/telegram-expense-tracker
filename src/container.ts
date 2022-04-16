import { PrismaClient } from '@prisma/client';
import { UserRepository } from './telegram-bot/repository/user-repository';
import { FamilyRepository } from './telegram-bot/repository/family-repository';
import { BankAccountRepository } from './telegram-bot/repository/bank-account-repository';
import { TransactionRepository } from './telegram-bot/repository/transaction-repository';

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
