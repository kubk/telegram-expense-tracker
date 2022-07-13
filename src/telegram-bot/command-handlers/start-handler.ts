import { Context, Markup } from 'telegraf';
import { assert } from 'ts-essentials';
import { buildBankAccountListMenu } from '../menu-builders/build-bank-account-list-menu';
import { bankAccountGetForUser } from '../../repository/bank-account-repository';
import {
  userCreateIfNotExists,
  userGetByTelegramIdOrThrow,
} from '../../repository/user-repository';

export const startHandler = async (ctx: Context) => {
  assert(ctx.message);
  await userCreateIfNotExists(ctx.message.from.id);
  const user = await userGetByTelegramIdOrThrow(ctx.message.from.id);
  const bankAccounts = await bankAccountGetForUser(user.id);
  await ctx.reply(
    `Hello 👋\nThis is a Telegram bot to track your expenses`,
    Markup.inlineKeyboard(buildBankAccountListMenu(bankAccounts))
  );
};
