import { PrismaClient } from '@prisma/client';

export const config = {
  logSql: false,
};

export const prisma = new PrismaClient({
  log: config.logSql ? ['query', 'info', 'warn', 'error'] : undefined,
});
