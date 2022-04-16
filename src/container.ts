import { PrismaClient } from '@prisma/client';
import { UserRepository } from './telegram-bot/user-repository';
import { FamilyRepository } from './telegram-bot/family-repository';
import { BankAccountRepository } from './telegram-bot/bank-account-repository';
import { TransactionRepository } from './telegram-bot/transaction-repository';

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
