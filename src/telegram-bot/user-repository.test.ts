import { userRepository } from '../container';
import { useRefreshDb } from '../utils/use-refresh-db';

useRefreshDb();

test('get user by telegram id', async () => {
  const truthyResult = await userRepository.getUserByTelegramId('test_user_1');
  expect(truthyResult).toBeTruthy();

  const falsyResult = await userRepository.getUserByTelegramId('doesnt_exist');
  expect(falsyResult).toBeFalsy();
});
