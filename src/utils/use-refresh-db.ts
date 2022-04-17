import { prisma } from '../container';
import { Currency } from '@prisma/client';
import { execPromise } from './exec-promise';
import { DateTime } from 'luxon';
import { getEnvSafe } from './get-env-safe';
import { UserState } from '../telegram-bot/user-state';

jest.setTimeout(10000);

export const fixtures = {
  users: {
    user_1: 'ac28d06d-9938-4f4c-a690-08115cf51d84',
    user_2: '9a9f9a8d-093a-4901-a439-8abb31392d77',
  },
  bankAccounts: {
    user_1_ba_try: '449cce5f-04b3-489b-96a0-2aa8fb14bc8f',
    user_1_ba_usd: '61637396-a7c2-4ccc-91b8-9098a62aee18',
  },
};

export const useRefreshDb = () => {
  afterEach(() => {
    prisma.$disconnect();
  });

  beforeEach(async () => {
    await execPromise(`dropdb ${getEnvSafe('DATABASE_NAME')}`);
    await execPromise(`createdb ${getEnvSafe('DATABASE_NAME')}`);
    await execPromise(`npx prisma db push`);

    prisma.$connect();

    await prisma.family.create({
      data: {
        users: {
          create: [
            {
              id: fixtures.users.user_1,
              telegramProfile: {
                create: {
                  telegramId: 1,
                  state: { type: 'initial' },
                },
              },
            },
            {
              id: fixtures.users.user_2,
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
              id: fixtures.bankAccounts.user_1_ba_try,
              currency: Currency.TRY,
              name: 'Yapi Kredi',
              transactions: {
                create: [
                  {
                    createdAt: new Date(),
                    amount: -550,
                    currency: Currency.TRY,
                    title: 'Migros Buy',
                    info: 'Other',
                  },
                  {
                    createdAt: new Date(),
                    amount: -5550,
                    currency: Currency.TRY,
                    title: 'Digital Ocean',
                    info: 'Other',
                  },
                ],
              },
            },
            {
              id: fixtures.bankAccounts.user_1_ba_usd,
              currency: Currency.USD,
              name: 'Yapi Kredi',
              transactions: {
                create: [
                  {
                    createdAt: new Date(),
                    amount: -1000,
                    currency: Currency.USD,
                    title: 'Amazon',
                    info: 'Other',
                  },
                  {
                    createdAt: new Date(),
                    amount: 2000 * 100,
                    currency: Currency.USD,
                    title: 'USDT withdraw',
                    info: 'Other',
                  },
                  {
                    createdAt: DateTime.now().minus({ month: 1 }).toJSDate(),
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
