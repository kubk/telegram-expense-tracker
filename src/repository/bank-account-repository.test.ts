import { fixtures, useRefreshDb } from '../fixtures/use-refresh-db';
import { bankRepository } from '../container';
import { TransactionType } from './transaction-repository';

useRefreshDb();

test('get BA list for a user', async () => {
  const ba1 = await bankRepository.getUserBankAccounts(fixtures.users.user_1);
  const ba2 = await bankRepository.getUserBankAccounts(fixtures.users.user_2);

  expect(ba1).toHaveLength(2);
  expect(ba2).toHaveLength(2);
});

test('get BA most popular manual transaction titles (autosuggest)', async () => {
  const expenseList = await bankRepository.getMostUsedTransactionTitles(
    fixtures.bankAccounts.user_1_ba_try,
    TransactionType.Expense
  );
  const topUpList = await bankRepository.getMostUsedTransactionTitles(
    fixtures.bankAccounts.user_1_ba_try,
    TransactionType.TopUp
  );

  expect(expenseList).toHaveLength(1);
  expect(topUpList).toHaveLength(0);
});
