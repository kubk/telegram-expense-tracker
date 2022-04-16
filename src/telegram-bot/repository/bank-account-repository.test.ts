import { fixtures, useRefreshDb } from '../../utils/use-refresh-db';
import { bankRepository } from '../../container';

useRefreshDb();

test('get BA list for a user', async () => {
  const ba1 = await bankRepository.getUserBankAccounts(fixtures.users.user_1);
  const ba2 = await bankRepository.getUserBankAccounts(fixtures.users.user_2);

  expect(ba1).toHaveLength(2);
  expect(ba2).toHaveLength(2);
});
