import { prisma } from '../container';
import { Currency, TransactionSource } from '@prisma/client';
import { DateTime } from 'luxon';
import { getEnvSafe } from '../lib/env/env';

jest.setTimeout(10000);

export const fixtures = {
  users: {
    user_1: { uuid: 'ac28d06d-9938-4f4c-a690-08115cf51d84', short: 1000 },
    user_2: { uuid: '9a9f9a8d-093a-4901-a439-8abb31392d77', short: 1001 },
  },
  bankAccounts: {
    user_1_ba_try: {
      uuid: '449cce5f-04b3-489b-96a0-2aa8fb14bc8f',
      short: 1002,
    },
    user_1_ba_usd: {
      uuid: '61637396-a7c2-4ccc-91b8-9098a62aee18',
      short: 1003,
    },
  },
};

const now = DateTime.fromISO('2022-04-05');

export const useRefreshDb = () => {
  afterEach(() => {
    prisma.$disconnect();
  });

  beforeEach(async () => {
    prisma.$connect();
    await prisma.$executeRawUnsafe(`
CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR) RETURNS void AS $$
DECLARE
    statements CURSOR FOR
        SELECT tablename FROM pg_tables
        WHERE tableowner = username AND schemaname = 'public';
BEGIN
    FOR stmt IN statements LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
    END LOOP;
END;
$$ LANGUAGE plpgsql;
    `);
    await prisma.$executeRawUnsafe(
      `SELECT truncate_tables('${getEnvSafe('DATABASE_USER')}')`
    );

    await prisma.family.create({
      data: {
        users: {
          create: [
            {
              id: fixtures.users.user_1.uuid,
              telegramProfile: {
                create: {
                  telegramId: 1,
                  state: { type: 'initial' },
                },
              },
            },
            {
              id: fixtures.users.user_2.uuid,
              telegramProfile: {
                create: {
                  telegramId: 2,
                  state: { type: 'initial' },
                },
              },
            },
          ],
        },
        bankAccounts: {
          create: [
            {
              id: fixtures.bankAccounts.user_1_ba_try.uuid,
              shortId: fixtures.bankAccounts.user_1_ba_try.short,
              currency: Currency.TRY,
              name: 'Yapi Kredi',
              transactions: {
                create: [
                  {
                    createdAt: now.toJSDate(),
                    amount: -550,
                    currency: Currency.TRY,
                    title: 'Migros Buy',
                    info: 'Other',
                  },
                  {
                    createdAt: now.toJSDate(),
                    amount: -5550,
                    currency: Currency.TRY,
                    title: 'Digital Ocean',
                    info: 'Other',
                  },
                  {
                    createdAt: now.toJSDate(),
                    amount: -5550,
                    currency: Currency.TRY,
                    title: 'Payment for UK certificate',
                    info: 'Other',
                    source: TransactionSource.MANUAL,
                    isCountable: false,
                  },
                ],
              },
            },
            {
              id: fixtures.bankAccounts.user_1_ba_usd.uuid,
              shortId: fixtures.bankAccounts.user_1_ba_usd.short,
              currency: Currency.USD,
              name: 'Yapi Kredi',
              transactions: {
                create: [
                  {
                    createdAt: now.toJSDate(),
                    amount: -1000,
                    currency: Currency.USD,
                    title: 'Amazon',
                    info: 'Other',
                  },
                  {
                    createdAt: now.toJSDate(),
                    amount: 2000 * 100,
                    currency: Currency.USD,
                    title: 'USDT withdraw',
                    info: 'Other',
                  },
                  {
                    createdAt: now.toJSDate(),
                    amount: -100 * 100,
                    currency: Currency.USD,
                    title: 'Payment for Digital Ocean',
                    info: 'Other',
                    isCountable: false,
                  },
                  {
                    createdAt: now.minus({ month: 1 }).toJSDate(),
                    amount: 500 * 100,
                    currency: Currency.USD,
                    title: 'I Talki',
                    info: 'Other',
                  },
                ],
              },
            },
          ],
        },
      },
    });
  });
};
