import { bankRepository, userRepository } from '../../container';
import { buildBankAccountListMenu } from '../menu-builders/build-bank-account-list-menu';
import { Context, Markup } from 'telegraf';
import { assert } from 'ts-essentials';

export const bankAccountListButtonHandler = async (ctx: Context) => {
  const [remove] = (ctx as any).match[1];
  assert(ctx.callbackQuery);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );
  const bankAccounts = await bankRepository.getUserBankAccounts(user.id);

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
