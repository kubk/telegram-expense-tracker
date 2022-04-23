import { fixtures, useRefreshDb } from '../utils/use-refresh-db';
import { transactionRepository } from '../container';

useRefreshDb();

test('transaction list for user and ba', async () => {
  const firstResult = await transactionRepository.getUserTransactionList({
    userId: fixtures.users.user_1,
    bankAccountId: fixtures.bankAccounts.user_1_ba_try,
    pagination: {
      page: 1,
    },
  });
  expect(firstResult.items).toHaveLength(2);

  const secondResult = await transactionRepository.getUserTransactionList({
    userId: fixtures.users.user_2,
    bankAccountId: fixtures.bankAccounts.user_1_ba_try,
    pagination: {
      page: 1,
    },
  });
  expect(secondResult.items).toHaveLength(2);

  const thirdResult = await transactionRepository.getUserTransactionList({
    userId: fixtures.users.user_1,
    bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
    pagination: {
      page: 1,
    },
  });
  expect(thirdResult.items).toHaveLength(3);

  const fourthResult = await transactionRepository.getUserTransactionList({
    userId: fixtures.users.user_2,
    bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
    pagination: {
      page: 1,
    },
  });
  expect(fourthResult.items).toHaveLength(3);
});

test('transactions pagination', async () => {
  const firstPageResult = await transactionRepository.getUserTransactionList({
    userId: fixtures.users.user_1,
    bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
    pagination: {
      page: 1,
      perPage: 2,
    },
  });
  expect(firstPageResult.currentPage).toBe(1);
  expect(firstPageResult.items.length).toBe(2);
  expect(firstPageResult.nextPage).toBe(2);
  expect(firstPageResult.previousPage).toBe(null);
  expect(firstPageResult.totalItemsCount).toBe(3);
  expect(firstPageResult.totalPages).toBe(2);

  const secondPageResult = await transactionRepository.getUserTransactionList({
    userId: fixtures.users.user_1,
    bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
    pagination: {
      page: 2,
      perPage: 2,
    },
  });
  expect(secondPageResult.currentPage).toBe(2);
  expect(secondPageResult.items.length).toBe(1);
  expect(secondPageResult.nextPage).toBe(null);
  expect(secondPageResult.previousPage).toBe(1);
  expect(secondPageResult.totalItemsCount).toBe(3);
  expect(secondPageResult.totalPages).toBe(2);
});

test('transaction monthly starts - TRY bank account', async () => {
  const expectedTryBankAccountStats = [
    {
      difference: -6100,
      income: 0,
      outcome: -6100,
      groupname: 'Apr',
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
      groupname: '16',
      income: 200000,
      outcome: -1000,
    },
    {
      currency: null,
      difference: 0,
      groupname: '15',
      income: 0,
      outcome: 0,
    },
    {
      currency: null,
      difference: 0,
      groupname: '14',
      income: 0,
      outcome: 0,
    },
    {
      currency: null,
      difference: 0,
      groupname: '13',
      income: 0,
      outcome: 0,
    },
    {
      currency: 'USD',
      difference: 50000,
      groupname: '12',
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
      groupname: 'Apr',
      currency: 'USD',
    },
    {
      difference: 50000,
      income: 50000,
      outcome: 0,
      groupname: 'Mar',
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

  expect(transactionsBefore.items.length).toBe(
    transactionsAfter.items.length - 1
  );
});
