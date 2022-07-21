import { fixtures, testNow, useRefreshDb } from '../fixtures/use-refresh-db';
import {
  FilterTransactionIsCountable,
  FilterTransactionSource,
  transactionCreateManual,
  transactionsGetForUser,
  transactionsGetGroupedStatistics,
  transactionsImport,
  TransactionSortDirection,
  TransactionSortField,
  UserTransactionListFilter,
} from './transaction-repository';
import { DateTime } from 'luxon';
import { Currency } from '@prisma/client';

useRefreshDb();

test('transaction list for user and ba', async () => {
  const firstResult = await transactionsGetForUser({
    userId: fixtures.users.user_1.uuid,
    bankAccountShortId: fixtures.bankAccounts.user_1_ba_try.short,
    pagination: {
      page: 1,
      perPage: 10,
    },
    filter: {
      filterSource: FilterTransactionSource.All,
      filterCountable: FilterTransactionIsCountable.All,
      transactionType: UserTransactionListFilter.NoFilter,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
      sortDirection: TransactionSortDirection.Desc,
      sortField: TransactionSortField.Date,
    },
  });
  expect(firstResult.items).toHaveLength(3);

  const secondResult = await transactionsGetForUser({
    userId: fixtures.users.user_2.uuid,
    bankAccountShortId: fixtures.bankAccounts.user_1_ba_try.short,
    pagination: {
      page: 1,
      perPage: 10,
    },
    filter: {
      filterSource: FilterTransactionSource.All,
      filterCountable: FilterTransactionIsCountable.All,
      transactionType: UserTransactionListFilter.NoFilter,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
      sortDirection: TransactionSortDirection.Desc,
      sortField: TransactionSortField.Date,
    },
  });
  expect(secondResult.items).toHaveLength(3);

  const thirdResult = await transactionsGetForUser({
    userId: fixtures.users.user_1.uuid,
    bankAccountShortId: fixtures.bankAccounts.user_1_ba_usd.short,
    pagination: {
      page: 1,
      perPage: 10,
    },
    filter: {
      filterSource: FilterTransactionSource.All,
      filterCountable: FilterTransactionIsCountable.All,
      transactionType: UserTransactionListFilter.NoFilter,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
      sortDirection: TransactionSortDirection.Desc,
      sortField: TransactionSortField.Date,
    },
  });
  expect(thirdResult.items).toHaveLength(4);

  const onlyOutcomeResult = await transactionsGetForUser({
    userId: fixtures.users.user_2.uuid,
    bankAccountShortId: fixtures.bankAccounts.user_1_ba_usd.short,
    pagination: {
      page: 1,
      perPage: 10,
    },
    filter: {
      filterSource: FilterTransactionSource.All,
      filterCountable: FilterTransactionIsCountable.All,
      transactionType: UserTransactionListFilter.OnlyOutcome,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
      sortDirection: TransactionSortDirection.Desc,
      sortField: TransactionSortField.Date,
    },
  });
  expect(onlyOutcomeResult.items).toHaveLength(2);

  const onlyIncomeResult = await transactionsGetForUser({
    userId: fixtures.users.user_2.uuid,
    bankAccountShortId: fixtures.bankAccounts.user_1_ba_usd.short,
    pagination: {
      page: 1,
      perPage: 10,
    },
    filter: {
      filterSource: FilterTransactionSource.All,
      filterCountable: FilterTransactionIsCountable.All,
      transactionType: UserTransactionListFilter.OnlyIncome,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
      sortDirection: TransactionSortDirection.Desc,
      sortField: TransactionSortField.Date,
    },
  });
  expect(onlyIncomeResult.items).toHaveLength(2);
});

test('transactions pagination', async () => {
  const firstPageResult = await transactionsGetForUser({
    userId: fixtures.users.user_1.uuid,
    bankAccountShortId: fixtures.bankAccounts.user_1_ba_usd.short,
    pagination: {
      page: 1,
      perPage: 2,
    },
    filter: {
      filterSource: FilterTransactionSource.All,
      filterCountable: FilterTransactionIsCountable.All,
      transactionType: UserTransactionListFilter.NoFilter,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
      sortDirection: TransactionSortDirection.Desc,
      sortField: TransactionSortField.Date,
    },
  });
  expect(firstPageResult.currentPage).toBe(1);
  expect(firstPageResult.items.length).toBe(2);
  expect(firstPageResult.nextPage).toBe(2);
  expect(firstPageResult.previousPage).toBe(null);
  expect(firstPageResult.totalItemsCount).toBe(4);
  expect(firstPageResult.totalPages).toBe(2);

  const secondPageResult = await transactionsGetForUser({
    userId: fixtures.users.user_1.uuid,
    bankAccountShortId: fixtures.bankAccounts.user_1_ba_usd.short,
    pagination: {
      page: 2,
      perPage: 2,
    },
    filter: {
      filterSource: FilterTransactionSource.All,
      filterCountable: FilterTransactionIsCountable.All,
      transactionType: UserTransactionListFilter.NoFilter,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
      sortDirection: TransactionSortDirection.Desc,
      sortField: TransactionSortField.Date,
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
    await transactionsGetGroupedStatistics({
      userId: fixtures.users.user_1.uuid,
      bankAccountId: fixtures.bankAccounts.user_1_ba_try.uuid,
    })
  ).toStrictEqual(expectedTryBankAccountStats);

  expect(
    await transactionsGetGroupedStatistics({
      userId: fixtures.users.user_2.uuid,
      bankAccountId: fixtures.bankAccounts.user_1_ba_try.uuid,
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
    await transactionsGetGroupedStatistics({
      userId: fixtures.users.user_1.uuid,
      bankAccountId: fixtures.bankAccounts.user_1_ba_usd.uuid,
    })
  ).toStrictEqual(expectedUsdBankAccountStats);

  expect(
    await transactionsGetGroupedStatistics({
      userId: fixtures.users.user_2.uuid,
      bankAccountId: fixtures.bankAccounts.user_1_ba_usd.uuid,
    })
  ).toStrictEqual(expectedUsdBankAccountStats);
});

test('create manual transaction', async () => {
  const transactionsBefore = await transactionsGetForUser({
    userId: fixtures.users.user_1.uuid,
    bankAccountShortId: fixtures.bankAccounts.user_1_ba_try.short,
    pagination: {
      page: 1,
      perPage: 10,
    },
    filter: {
      filterSource: FilterTransactionSource.All,
      filterCountable: FilterTransactionIsCountable.All,
      transactionType: UserTransactionListFilter.NoFilter,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
      sortDirection: TransactionSortDirection.Desc,
      sortField: TransactionSortField.Date,
    },
  });

  await transactionCreateManual({
    bankAccountId: fixtures.bankAccounts.user_1_ba_try.uuid,
    title: 'Rent',
    currency: 'TRY',
    amount: 2700 * 1000,
  });

  const transactionsAfter = await transactionsGetForUser({
    userId: fixtures.users.user_1.uuid,
    bankAccountShortId: fixtures.bankAccounts.user_1_ba_try.short,
    pagination: {
      page: 1,
      perPage: 10,
    },
    filter: {
      filterSource: FilterTransactionSource.All,
      filterCountable: FilterTransactionIsCountable.All,
      transactionType: UserTransactionListFilter.NoFilter,
      dateFrom: DateTime.now().startOf('year').toJSDate(),
      dateTo: DateTime.now().endOf('year').toJSDate(),
      sortDirection: TransactionSortDirection.Desc,
      sortField: TransactionSortField.Date,
    },
  });

  expect(transactionsBefore.items.length).toBe(
    transactionsAfter.items.length - 1
  );
});

test('importTransaction applies import rules and does not touch non-matched transactions', async () => {
  const getLast10Transactions = () =>
    transactionsGetForUser({
      userId: fixtures.users.user_1.uuid,
      bankAccountShortId: fixtures.bankAccounts.user_1_ba_try.short,
      pagination: {
        page: 1,
        perPage: 10,
      },
      filter: {
        filterSource: FilterTransactionSource.All,
        filterCountable: FilterTransactionIsCountable.All,
        transactionType: UserTransactionListFilter.NoFilter,
        dateFrom: DateTime.now().startOf('year').toJSDate(),
        dateTo: DateTime.now().endOf('year').toJSDate(),
        sortDirection: TransactionSortDirection.Desc,
        sortField: TransactionSortField.Date,
      },
    });

  const expectedUsdBankAccountBeforeImport = expect.arrayContaining([
    expect.objectContaining({
      title: 'Migros Buy',
      isCountable: true,
    }),
    expect.objectContaining({
      title: 'Digital Ocean',
      isCountable: true,
    }),
    expect.objectContaining({
      title: 'Payment for UK certificate',
      isCountable: false,
    }),
  ]);

  const actualBeforeImport = (await getLast10Transactions()).items;
  expect(actualBeforeImport).toStrictEqual(expectedUsdBankAccountBeforeImport);

  await transactionsImport(fixtures.bankAccounts.user_1_ba_try.uuid, [
    {
      createdAt: testNow.toJSDate(),
      amount: -550,
      currency: Currency.TRY,
      title: 'Migros Buy',
      info: 'Other',
    },
    {
      createdAt: testNow.toJSDate(),
      amount: -5550,
      currency: Currency.TRY,
      title: 'Digital Ocean',
      info: 'Other',
    },
    {
      createdAt: testNow.toJSDate(),
      amount: -5550,
      currency: Currency.TRY,
      title: 'Payment for UK certificate',
      info: 'Other',
    },
  ]);

  const expectedUsdBankAccountAfterImport = expect.arrayContaining([
    expect.objectContaining({
      title: 'Migros', // <-- Changed from Migros Buy to Migros because there is a rule in fixtures
      isCountable: true,
    }),
    expect.not.objectContaining({
      title: 'Migros Buy', // <-- Changed from Migros Buy to Migros because there is a rule in fixtures
      isCountable: true,
    }),
    expect.objectContaining({
      title: 'Digital Ocean',
      isCountable: false, // <-- Changed to false because there is a rule in fixtures
    }),
    expect.not.objectContaining({
      title: 'Digital Ocean',
      isCountable: true, // <-- Changed to false because there is a rule in fixtures
    }),
    expect.objectContaining({
      title: 'Payment for UK certificate',
      isCountable: false,
    }),
  ]);

  const actualAfterImport = (await getLast10Transactions()).items;
  expect(actualAfterImport).toStrictEqual(expectedUsdBankAccountAfterImport);
});
