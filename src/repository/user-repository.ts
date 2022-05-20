import { v4 } from 'uuid';
import { UserState } from '../telegram-bot/user-state';
import { assert } from 'ts-essentials';
import { prisma } from '../container';

export class UserRepository {
  getUserByTelegramId(telegramId: number) {
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
  }

  async getUserByTelegramIdOrThrow(telegramId: number) {
    const user = await this.getUserByTelegramId(telegramId);
    assert(user);
    const telegramProfile = user.telegramProfile;
    assert(telegramProfile);
    return { ...user, telegramProfile };
  }

  getUserList() {
    return prisma.user.findMany();
  }

  async createUserIfNotExists(telegramId: number) {
    const user = await this.getUserByTelegramId(telegramId);
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
  }

  setUserState(telegramProfileId: string, state: UserState) {
    return prisma.telegramProfile.update({
      data: {
        state,
      },
      where: {
        id: telegramProfileId,
      },
    });
  }
}
