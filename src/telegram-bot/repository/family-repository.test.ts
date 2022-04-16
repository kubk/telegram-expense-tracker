import { useRefreshDb } from '../../utils/use-refresh-db';
import { familyRepository } from '../../container';

useRefreshDb();

test('family list with related entities', async () => {
  const result = await familyRepository.getFamilyListWithUsersAndProfiles();

  expect(result).toHaveLength(1);
  expect(result[0].users).toHaveLength(2);
});
