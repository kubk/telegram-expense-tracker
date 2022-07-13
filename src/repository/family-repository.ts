import { prisma } from '../db/prisma';

export const familyListGetWithUsersAndProfiles = () => {
  return prisma.family.findMany({
    include: {
      users: {
        include: {
          telegramProfile: true,
        },
      },
    },
  });
};
