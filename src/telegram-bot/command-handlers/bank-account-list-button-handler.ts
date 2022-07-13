import { buildBankAccountListMenu } from '../menu-builders/build-bank-account-list-menu';
import { Context, Markup } from 'telegraf';
import { assert } from 'ts-essentials';
import { bankAccountGetForUser } from '../../repository/bank-account-repository';
import { userGetByTelegramIdOrThrow } from '../../repository/user-repository';

export const bankAccountListButtonHandler = async (ctx: Context) => {
  const [, remove] = (ctx as any).match;
  assert(ctx.callbackQuery);
  const user = await userGetByTelegramIdOrThrow(ctx.callbackQuery.from.id);
  const bankAccounts = await bankAccountGetForUser(user.id);

  if (remove === 'remove') {
    await ctx.deleteMessage();
    await ctx.reply(
      `Hello 👋\nThis is a Telegram bot to track your expenses`,
      Markup.inlineKeyboard(buildBankAccountListMenu(bankAccounts))
    );
  } else {
    await ctx.editMessageReplyMarkup({
      inline_keyboard: buildBankAccountListMenu(bankAccounts),
    });
  }
};
