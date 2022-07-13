import { Context, Markup } from 'telegraf';
import { assert } from 'ts-essentials';
import { buildBankAccountListMenu } from '../menu-builders/build-bank-account-list-menu';
import { bankAccountGetForUser } from '../../repository/bank-account-repository';
import {
  userGetByTelegramIdOrThrow,
  userSetState,
} from '../../repository/user-repository';

export const cancelHandler = async (ctx: Context) => {
  assert(ctx.message);
  const user = await userGetByTelegramIdOrThrow(ctx.message.from.id);
  await userSetState(user.telegramProfile.id, {
    type: 'initial',
  });

  const bankAccounts = await bankAccountGetForUser(user.id);
  await ctx.reply(
    `Hello 👋\nThis is a Telegram bot to track your expenses`,
    Markup.inlineKeyboard(buildBankAccountListMenu(bankAccounts))
  );
};
