import { prisma } from '../container';

export class FamilyRepository {
  getFamilyListWithUsersAndProfiles() {
    return prisma.family.findMany({
      include: {
        users: {
          include: {
            telegramProfile: true,
          },
        },
      },
    });
  }
}
