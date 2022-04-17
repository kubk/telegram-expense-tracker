import { fixtures, useRefreshDb } from '../utils/use-refresh-db';
import { transactionRepository } from '../container';

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

test('transaction monthly starts - TRY bank account', async () => {
  const expectedTryBankAccountStats = [
    {
      difference: -6100,
      income: 0,
      outcome: -6100,
      groupname: 'April',
      currency: 'TRY',
    },
  ];

  expect(
    await transactionRepository.getUserTransactionsExpenses({
      userId: fixtures.users.user_1,
      bankAccountId: fixtures.bankAccounts.user_1_ba_try,
      type: 'monthly',
    })
  ).toStrictEqual(expectedTryBankAccountStats);

  expect(
    await transactionRepository.getUserTransactionsExpenses({
      userId: fixtures.users.user_2,
      bankAccountId: fixtures.bankAccounts.user_1_ba_try,
      type: 'monthly',
    })
  ).toStrictEqual(expectedTryBankAccountStats);
});

test('transaction weekly starts - USD bank account', async () => {
  const expectedTryBankAccountStats = [
    {
      currency: 'USD',
      difference: 199000,
      groupname: 15,
      income: 200000,
      outcome: -1000,
    },
    {
      currency: null,
      difference: 0,
      groupname: 14,
      income: 0,
      outcome: 0,
    },
    {
      currency: null,
      difference: 0,
      groupname: 13,
      income: 0,
      outcome: 0,
    },
    {
      currency: null,
      difference: 0,
      groupname: 12,
      income: 0,
      outcome: 0,
    },
    {
      currency: 'USD',
      difference: 50000,
      groupname: 11,
      income: 50000,
      outcome: 0,
    },
  ];

  expect(
    await transactionRepository.getUserTransactionsExpenses({
      userId: fixtures.users.user_1,
      bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
      type: 'weekly',
    })
  ).toStrictEqual(expectedTryBankAccountStats);

  expect(
    await transactionRepository.getUserTransactionsExpenses({
      userId: fixtures.users.user_2,
      bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
      type: 'weekly',
    })
  ).toStrictEqual(expectedTryBankAccountStats);
});

test('transaction monthly stats - USD bank account', async () => {
  const expectedUsdBankAccountStats = [
    {
      difference: 199000,
      income: 200000,
      outcome: -1000,
      groupname: 'April',
      currency: 'USD',
    },
    {
      difference: 50000,
      income: 50000,
      outcome: 0,
      groupname: 'March',
      currency: 'USD',
    },
  ];

  expect(
    await transactionRepository.getUserTransactionsExpenses({
      userId: fixtures.users.user_1,
      bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
      type: 'monthly',
    })
  ).toStrictEqual(expectedUsdBankAccountStats);

  expect(
    await transactionRepository.getUserTransactionsExpenses({
      userId: fixtures.users.user_2,
      bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
      type: 'monthly',
    })
  ).toStrictEqual(expectedUsdBankAccountStats);
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
