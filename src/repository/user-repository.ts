import { v4 } from 'uuid';
import { UserState } from '../telegram-bot/user-state';
import { assert } from 'ts-essentials';
import { prisma } from '../db/prisma';

export const userGetByTelegramId = (telegramId: number) => {
  return prisma.user.findFirst({
    where: {
      telegramProfile: {
        telegramId: telegramId,
      },
    },
    include: {
      telegramProfile: true,
      family: true,
    },
  });
};

export const userGetByTelegramIdOrThrow = async (telegramId: number) => {
  const user = await userGetByTelegramId(telegramId);
  assert(user);
  const telegramProfile = user.telegramProfile;
  assert(telegramProfile);
  return { ...user, telegramProfile };
};

export const usersGet = () => {
  return prisma.user.findMany();
};

export const userCreateIfNotExists = async (telegramId: number) => {
  const user = await userGetByTelegramId(telegramId);
  if (user) {
    return user;
  }

  return prisma.user.create({
    data: {
      id: v4(),
      telegramProfile: {
        create: {
          telegramId: telegramId,
          state: { type: 'initial' },
        },
      },
      family: {
        create: {
          id: v4(),
        },
      },
    },
  });
};

export const userSetState = (telegramProfileId: string, state: UserState) => {
  return prisma.telegramProfile.update({
    data: {
      state,
    },
    where: {
      id: telegramProfileId,
    },
  });
};
