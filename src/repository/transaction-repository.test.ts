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
    },
    filter: {
      transactionType: UserTransactionListFilter.NoFilter,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
    },
  });
  expect(firstResult.items).toHaveLength(2);

  const secondResult = await transactionRepository.getUserTransactionList({
    userId: fixtures.users.user_2,
    bankAccountId: fixtures.bankAccounts.user_1_ba_try,
    pagination: {
      page: 1,
    },
    filter: {
      transactionType: UserTransactionListFilter.NoFilter,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
    },
  });
  expect(secondResult.items).toHaveLength(2);

  const thirdResult = await transactionRepository.getUserTransactionList({
    userId: fixtures.users.user_1,
    bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
    pagination: {
      page: 1,
    },
    filter: {
      transactionType: UserTransactionListFilter.NoFilter,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
    },
  });
  expect(thirdResult.items).toHaveLength(3);

  const onlyOutcomeResult = await transactionRepository.getUserTransactionList({
    userId: fixtures.users.user_2,
    bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
    pagination: {
      page: 1,
    },
    filter: {
      transactionType: UserTransactionListFilter.OnlyOutcome,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
    },
  });
  expect(onlyOutcomeResult.items).toHaveLength(1);

  const onlyIncomeResult = await transactionRepository.getUserTransactionList({
    userId: fixtures.users.user_2,
    bankAccountId: fixtures.bankAccounts.user_1_ba_usd,
    pagination: {
      page: 1,
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
  expect(firstPageResult.totalItemsCount).toBe(3);
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
  expect(secondPageResult.items.length).toBe(1);
  expect(secondPageResult.nextPage).toBe(null);
  expect(secondPageResult.previousPage).toBe(1);
  expect(secondPageResult.totalItemsCount).toBe(3);
  expect(secondPageResult.totalPages).toBe(2);
});

test('transaction monthly starts - TRY bank account', async () => {
  const expectedTryBankAccountStats: UserTransactionExpenseRowItem[] = [
    {
      difference: -6100,
      income: 0,
      outcome: -6100,
      groupname: 'May',
      groupyear: 2022,
      groupnumber: 5,
      currency: 'TRY',
    },
  ];

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
  const expectedTryBankAccountStats: UserTransactionExpenseRowItem[] = [
    {
      currency: 'USD',
      difference: 199000,
      groupname: 'W.17',
      groupyear: 2022,
      groupnumber: 17,
      income: 200000,
      outcome: -1000,
    },
    {
      currency: null,
      difference: 0,
      groupname: 'W.16',
      groupyear: 2022,
      groupnumber: 16,
      income: 0,
      outcome: 0,
    },
    {
      currency: null,
      difference: 0,
      groupname: 'W.15',
      groupyear: 2022,
      groupnumber: 15,
      income: 0,
      outcome: 0,
    },
    {
      currency: null,
      difference: 0,
      groupname: 'W.14',
      groupyear: 2022,
      groupnumber: 14,
      income: 0,
      outcome: 0,
    },
    {
      currency: 'USD',
      difference: 50000,
      groupname: 'W.13',
      groupyear: 2022,
      groupnumber: 13,
      income: 50000,
      outcome: 0,
    },
  ];

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
  const expectedUsdBankAccountStats: UserTransactionExpenseRowItem[] = [
    {
      difference: 199000,
      income: 200000,
      outcome: -1000,
      groupname: 'May',
      groupyear: 2022,
      groupnumber: 5,
      currency: 'USD',
    },
    {
      difference: 50000,
      income: 50000,
      outcome: 0,
      groupname: 'Apr',
      groupyear: 2022,
      groupnumber: 4,
      currency: 'USD',
    },
  ];

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
