import { PrismaClient } from '@prisma/client';

export class FamilyRepository {
  constructor(private prisma: PrismaClient) {}

  getFamilyListWithUsersAndProfiles() {
    return this.prisma.family.findMany({
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
