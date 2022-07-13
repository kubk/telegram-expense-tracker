import { useRefreshDb } from '../fixtures/use-refresh-db';
import { familyListGetWithUsersAndProfiles } from './family-repository';

useRefreshDb();

test('family list with related entities', async () => {
  const result = await familyListGetWithUsersAndProfiles();

  expect(result).toHaveLength(1);
  expect(result[0].users).toHaveLength(2);
});
