import { Context, Markup } from 'telegraf';
import { assert } from 'ts-essentials';
import { bankRepository, userRepository } from '../../container';
import { buildBankAccountListMenu } from '../menu-builders/build-bank-account-list-menu';

export const startHandler = async (ctx: Context) => {
  assert(ctx.message);
  await userRepository.createUserIfNotExists(ctx.message.from.id);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.message.from.id
  );
  const bankAccounts = await bankRepository.getUserBankAccounts(user.id);
  await ctx.reply(
    `Hello 👋\nThis is a Telegram bot to track your expenses`,
    Markup.inlineKeyboard(buildBankAccountListMenu(bankAccounts))
  );
};
