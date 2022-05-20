import { fixtures, useRefreshDb } from '../fixtures/use-refresh-db';
import { transactionRepository } from '../container';
import {
  StatisticGroupByType,
  UserTransactionExpenseRowItem,
  UserTransactionListFilter,
} from './transaction-repository';
import { DateTime } from 'luxon';

useRefreshDb();

test('transaction list for user and ba', async () => {
  const firstResult = await transactionRepository.getUserTransactionList({
    userId: fixtures.users.user_1,
    bankAccountId: fixtures.bankAccounts.user_1_ba_try,
    pagination: {
      page: 1,
      perPage: 10,
    },
    filter: {
      transactionType: UserTransactionListFilter.NoFilter,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
    },
  });
  expect(firstResult.items).toHaveLength(3);

  const secondResult = await transactionRepository.getUserTransactionList({
    userId: fixtures.users.user_2,
    bankAccountId: fixtures.bankAccounts.user_1_ba_try,
    pagination: {
      page: 1,
      perPage: 10,
    },
    filter: {
      transactionType: UserTransactionListFilter.NoFilter,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
    },
  });
  expect(secondResult.items).toHaveLength(3);

  const thirdResult = await transactionRepository.getUserTransactionList({
    userId: fixtures.users.user_1,
    bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
    pagination: {
      page: 1,
      perPage: 10,
    },
    filter: {
      transactionType: UserTransactionListFilter.NoFilter,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
    },
  });
  expect(thirdResult.items).toHaveLength(4);

  const onlyOutcomeResult = await transactionRepository.getUserTransactionList({
    userId: fixtures.users.user_2,
    bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
    pagination: {
      page: 1,
      perPage: 10,
    },
    filter: {
      transactionType: UserTransactionListFilter.OnlyOutcome,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
    },
  });
  expect(onlyOutcomeResult.items).toHaveLength(2);

  const onlyIncomeResult = await transactionRepository.getUserTransactionList({
    userId: fixtures.users.user_2,
    bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
    pagination: {
      page: 1,
      perPage: 10,
    },
    filter: {
      transactionType: UserTransactionListFilter.OnlyIncome,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
    },
  });
  expect(onlyIncomeResult.items).toHaveLength(2);
});

test('transactions pagination', async () => {
  const firstPageResult = await transactionRepository.getUserTransactionList({
    userId: fixtures.users.user_1,
    bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
    pagination: {
      page: 1,
      perPage: 2,
    },
    filter: {
      transactionType: UserTransactionListFilter.NoFilter,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
    },
  });
  expect(firstPageResult.currentPage).toBe(1);
  expect(firstPageResult.items.length).toBe(2);
  expect(firstPageResult.nextPage).toBe(2);
  expect(firstPageResult.previousPage).toBe(null);
  expect(firstPageResult.totalItemsCount).toBe(4);
  expect(firstPageResult.totalPages).toBe(2);

  const secondPageResult = await transactionRepository.getUserTransactionList({
    userId: fixtures.users.user_1,
    bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
    pagination: {
      page: 2,
      perPage: 2,
    },
    filter: {
      transactionType: UserTransactionListFilter.NoFilter,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
    },
  });
  expect(secondPageResult.currentPage).toBe(2);
  expect(secondPageResult.items.length).toBe(2);
  expect(secondPageResult.nextPage).toBe(null);
  expect(secondPageResult.previousPage).toBe(1);
  expect(secondPageResult.totalItemsCount).toBe(4);
  expect(secondPageResult.totalPages).toBe(2);
});

test('transaction monthly starts - TRY bank account', async () => {
  const expectedTryBankAccountStats = expect.arrayContaining([
    expect.objectContaining({
      difference: 0,
      income: 0,
      outcome: 0,
      groupname: 'May',
      groupyear: 2022,
      groupnumber: 5,
      currency: null,
    }),
    expect.objectContaining({
      difference: -6100,
      income: 0,
      outcome: -6100,
      groupname: 'Apr',
      groupyear: 2022,
      groupnumber: 4,
      currency: 'TRY',
    }),
  ]);

  expect(
    await transactionRepository.getUserTransactionsExpensesGrouped({
      userId: fixtures.users.user_1,
      bankAccountId: fixtures.bankAccounts.user_1_ba_try,
      type: StatisticGroupByType.Month,
    })
  ).toStrictEqual(expectedTryBankAccountStats);

  expect(
    await transactionRepository.getUserTransactionsExpensesGrouped({
      userId: fixtures.users.user_2,
      bankAccountId: fixtures.bankAccounts.user_1_ba_try,
      type: StatisticGroupByType.Month,
    })
  ).toStrictEqual(expectedTryBankAccountStats);
});

test('transaction weekly starts - USD bank account', async () => {
  const expectedTryBankAccountStats = expect.arrayContaining([
    expect.objectContaining({
      currency: 'USD',
      difference: 199000,
      groupname: 'W.14',
      groupnumber: 14,
      groupyear: 2022,
      income: 200000,
      outcome: -1000,
    }),
    expect.objectContaining({
      currency: null,
      difference: 0,
      groupname: 'W.13',
      groupnumber: 13,
      groupyear: 2022,
      income: 0,
      outcome: 0,
    }),
    expect.objectContaining({
      currency: null,
      difference: 0,
      groupname: 'W.12',
      groupnumber: 12,
      groupyear: 2022,
      income: 0,
      outcome: 0,
    }),
    expect.objectContaining({
      currency: null,
      difference: 0,
      groupyear: 2022,
      groupname: 'W.11',
      groupnumber: 11,
      income: 0,
      outcome: 0,
    }),
    expect.objectContaining({
      currency: null,
      difference: 0,
      groupname: 'W.10',
      groupnumber: 10,
      groupyear: 2022,
      income: 0,
      outcome: 0,
    }),
    expect.objectContaining({
      currency: 'USD',
      difference: 50000,
      groupname: 'W.9',
      groupnumber: 9,
      groupyear: 2022,
      income: 50000,
      outcome: 0,
    }),
  ]);

  expect(
    await transactionRepository.getUserTransactionsExpensesGrouped({
      userId: fixtures.users.user_1,
      bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
      type: StatisticGroupByType.Week,
    })
  ).toStrictEqual(expectedTryBankAccountStats);

  expect(
    await transactionRepository.getUserTransactionsExpensesGrouped({
      userId: fixtures.users.user_2,
      bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
      type: StatisticGroupByType.Week,
    })
  ).toStrictEqual(expectedTryBankAccountStats);
});

test('transaction monthly stats - USD bank account', async () => {
  const expectedUsdBankAccountStats = expect.arrayContaining([
    expect.objectContaining({
      difference: 199000,
      income: 200000,
      outcome: -1000,
      groupname: 'Apr',
      groupyear: 2022,
      groupnumber: 4,
      currency: 'USD',
    }),
    expect.objectContaining({
      difference: 50000,
      income: 50000,
      outcome: 0,
      groupname: 'Mar',
      groupyear: 2022,
      groupnumber: 3,
      currency: 'USD',
    }),
  ]);

  expect(
    await transactionRepository.getUserTransactionsExpensesGrouped({
      userId: fixtures.users.user_1,
      bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
      type: StatisticGroupByType.Month,
    })
  ).toStrictEqual(expectedUsdBankAccountStats);

  expect(
    await transactionRepository.getUserTransactionsExpensesGrouped({
      userId: fixtures.users.user_2,
      bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
      type: StatisticGroupByType.Month,
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
        perPage: 10,
      },
      filter: {
        transactionType: UserTransactionListFilter.NoFilter,
        dateFrom: DateTime.now().startOf('year').toJSDate(),
        dateTo: DateTime.now().endOf('year').toJSDate(),
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
      perPage: 10,
    },
    filter: {
      transactionType: UserTransactionListFilter.NoFilter,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
    },
  });

  expect(transactionsBefore.items.length).toBe(
    transactionsAfter.items.length - 1
  );
});
