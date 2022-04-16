import { PrismaClient, User } from '@prisma/client';
import { v4 } from 'uuid';
import { UserState } from '../user-state';
import { assert } from 'ts-essentials';

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  getUserByTelegramId(telegramId: number) {
    return this.prisma.user.findFirst({
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
    return user;
  }

  getUserList() {
    return this.prisma.user.findMany();
  }

  async createUserIfNotExists(telegramId: number) {
    const user = await this.getUserByTelegramId(telegramId);
    if (user) {
      return user;
    }

    return this.prisma.user.create({
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
    return this.prisma.telegramProfile.update({
      data: {
        state,
      },
      where: {
        id: telegramProfileId,
      },
    });
  }
}
