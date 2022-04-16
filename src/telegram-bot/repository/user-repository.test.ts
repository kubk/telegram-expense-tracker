import { userRepository } from '../../container';
import { useRefreshDb } from '../../utils/use-refresh-db';

useRefreshDb();

test('get user by telegram id', async () => {
  const truthyResult = await userRepository.getUserByTelegramId(1);
  expect(truthyResult).toBeTruthy();

  const falsyResult = await userRepository.getUserByTelegramId(9999);
  expect(falsyResult).toBeFalsy();
});

test('creates user if not exist', async () => {
  const beforeCreate = await userRepository.getUserList();

  await userRepository.createUserIfNotExists(10);

  const afterCreate = await userRepository.getUserList();
  expect(beforeCreate.length).toBe(afterCreate.length - 1);
});

test('does not create user if not exist', async () => {
  const beforeCreate = await userRepository.getUserList();

  await userRepository.createUserIfNotExists(1);

  const afterCreate = await userRepository.getUserList();
  expect(beforeCreate.length).toBe(afterCreate.length);
});
