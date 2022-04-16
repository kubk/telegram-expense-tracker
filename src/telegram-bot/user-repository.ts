import { PrismaClient } from '@prisma/client';

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  getUserByTelegramId(telegramId: string) {
    return this.prisma.user.findFirst({
      where: {
        telegramProfile: {
          telegramId,
        },
      },
    });
  }
}
