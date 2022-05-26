import { PrismaClient } from '@prisma/client';
import { UserRepository } from './repository/user-repository';
import { FamilyRepository } from './repository/family-repository';
import { BankAccountRepository } from './repository/bank-account-repository';
import { TransactionRepository } from './repository/transaction-repository';
import { createBot } from './telegram-bot/create-bot';
import { createCache } from './currency-converter/create-cache';
import { isDev } from './lib/env/env';

export const config = {
  logSql: false,
};

export const prisma = new PrismaClient({
  log: config.logSql ? ['query', 'info', 'warn', 'error'] : undefined,
});
export const userRepository = new UserRepository();
export const familyRepository = new FamilyRepository();
export const bankRepository = new BankAccountRepository();
export const transactionRepository = new TransactionRepository();
export const cache = createCache({
  cachePath: `${__dirname}/../cache`,
  zip: !isDev(),
});
export const bot = createBot({ logTelegram: false });
