import { useRefreshDb } from '../fixtures/use-refresh-db';
import {
  userCreateIfNotExists,
  userGetByTelegramId,
  usersGet,
} from './user-repository';

useRefreshDb();

test('get user by telegram id', async () => {
  const truthyResult = await userGetByTelegramId(1);
  expect(truthyResult).toBeTruthy();

  const falsyResult = await userGetByTelegramId(9999);
  expect(falsyResult).toBeFalsy();
});

test('creates user if not exist', async () => {
  const beforeCreate = await usersGet();

  await userCreateIfNotExists(10);

  const afterCreate = await usersGet();
  expect(beforeCreate.length).toBe(afterCreate.length - 1);
});

test('does not create user if not exist', async () => {
  const beforeCreate = await usersGet();

  await userCreateIfNotExists(1);

  const afterCreate = await usersGet();
  expect(beforeCreate.length).toBe(afterCreate.length);
});
