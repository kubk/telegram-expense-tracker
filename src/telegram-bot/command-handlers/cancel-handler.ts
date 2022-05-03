import { Context, Markup } from 'telegraf';
import { assert } from 'ts-essentials';
import { bankRepository, userRepository } from '../../container';
import { buildBankAccountListMenu } from '../menu-builders/build-bank-account-list-menu';

export const cancelHandler = async (ctx: Context) => {
  assert(ctx.message);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.message.from.id
  );
  assert(user.telegramProfile);
  await userRepository.setUserState(user.telegramProfile.id, {
    type: 'initial',
  });

  const bankAccounts = await bankRepository.getUserBankAccounts(user.id);
  await ctx.reply(
    `Hello 👋\nThis is a Telegram bot to track your expenses`,
    Markup.inlineKeyboard(buildBankAccountListMenu(bankAccounts))
  );
};
