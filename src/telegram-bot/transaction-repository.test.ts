import { fixtures, useRefreshDb } from '../utils/use-refresh-db';
import { transactionRepository } from '../container';
import { DateTime } from 'luxon';

useRefreshDb();

test('transaction list for user and ba', async () => {
  expect(
    await transactionRepository.getUserTransactionList({
      userId: fixtures.users.user_1,
      bankAccountId: fixtures.bankAccounts.user_1_ba_try,
      pagination: {
        page: 1,
      },
    })
  ).toHaveLength(2);

  expect(
    await transactionRepository.getUserTransactionList({
      userId: fixtures.users.user_2,
      bankAccountId: fixtures.bankAccounts.user_1_ba_try,
      pagination: {
        page: 1,
      },
    })
  ).toHaveLength(2);

  expect(
    await transactionRepository.getUserTransactionList({
      userId: fixtures.users.user_1,
      bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
      pagination: {
        page: 1,
      },
    })
  ).toHaveLength(3);

  expect(
    await transactionRepository.getUserTransactionList({
      userId: fixtures.users.user_2,
      bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
      pagination: {
        page: 1,
      },
    })
  ).toHaveLength(3);
});

test('transaction stats income, outcome during a period of time - TRY bank account', async () => {
  const expectedTryBankAccountStats = {
    difference: -6100,
    income: 0,
    outcome: -6100,
    currency: 'TRY',
  };

  const filters = {
    dateTo: DateTime.now().plus({ day: 1 }),
    dateFrom: DateTime.now().minus({ day: 1 }),
  };

  expect(
    await transactionRepository.getUserTransactionsExpenses({
      userId: fixtures.users.user_1,
      bankAccountId: fixtures.bankAccounts.user_1_ba_try,
      ...filters,
    })
  ).toStrictEqual(expectedTryBankAccountStats);

  expect(
    await transactionRepository.getUserTransactionsExpenses({
      userId: fixtures.users.user_2,
      bankAccountId: fixtures.bankAccounts.user_1_ba_try,
      ...filters,
    })
  ).toStrictEqual(expectedTryBankAccountStats);
});

test('transaction stats income, outcome during a period of time - USD bank account', async () => {
  const expectedUsdBankAccountStats = {
    difference: 249000,
    income: 250000,
    outcome: -1000,
    currency: 'USD',
  };

  const filters = {
    dateTo: DateTime.now().plus({ day: 1 }),
    dateFrom: DateTime.now().minus({ day: 1 }),
  };

  expect(
    await transactionRepository.getUserTransactionsExpenses({
      userId: fixtures.users.user_1,
      bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
      ...filters,
    })
  ).toStrictEqual(expectedUsdBankAccountStats);

  expect(
    await transactionRepository.getUserTransactionsExpenses({
      userId: fixtures.users.user_2,
      bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
      ...filters,
    })
  ).toStrictEqual(expectedUsdBankAccountStats);
});

test('filter that excludes last transaction', async () => {
  expect(
    await transactionRepository.getUserTransactionsExpenses({
      userId: fixtures.users.user_1,
      bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
      dateTo: DateTime.now().plus({ day: 2 }).endOf('day'),
      dateFrom: DateTime.now().plus({ day: 1 }).startOf('day'),
    })
  ).toStrictEqual({
    difference: 50000,
    income: 50000,
    outcome: 0,
    currency: 'USD',
  });

  expect(
    await transactionRepository.getUserTransactionsExpenses({
      userId: fixtures.users.user_1,
      bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
      dateTo: DateTime.now().endOf('day'),
      dateFrom: DateTime.now().minus({ day: 1 }).startOf('day'),
    })
  ).toStrictEqual({
    difference: 199000,
    income: 200000,
    outcome: -1000,
    currency: 'USD',
  });
});

test('create manual transaction', async () => {
  const transactionsBefore = await transactionRepository.getUserTransactionList(
    {
      userId: fixtures.users.user_1,
      bankAccountId: fixtures.bankAccounts.user_1_ba_try,
      pagination: {
        page: 1,
      },
    }
  );

  await transactionRepository.createManualTransaction({
    bankAccountId: fixtures.bankAccounts.user_1_ba_try,
    title: 'Rent',
    currency: 'TRY',
    amount: 2700 * 1000,
  });

  const transactionsAfter = await transactionRepository.getUserTransactionList({
    userId: fixtures.users.user_1,
    bankAccountId: fixtures.bankAccounts.user_1_ba_try,
    pagination: {
      page: 1,
    },
  });

  expect(transactionsBefore.length).toBe(transactionsAfter.length - 1);
});
