import { Context, Markup } from 'telegraf';
import { assert } from 'ts-essentials';
import { buildBankAccountListMenu } from '../menu-builders/build-bank-account-list-menu';
import { bankAccountGetForUser } from '../../repository/bank-account-repository';
import { transactionDelete } from '../../repository/transaction-repository';
import { userGetByTelegramIdOrThrow } from '../../repository/user-repository';

export const transactionDeleteDoHandler = async (ctx: Context) => {
  const transactionId = (ctx as any).match[1];
  if (!transactionId) {
    return;
  }
  await transactionDelete(transactionId);
  await ctx.deleteMessage();

  assert(ctx.callbackQuery);
  const user = await userGetByTelegramIdOrThrow(ctx.callbackQuery.from.id);
  const bankAccounts = await bankAccountGetForUser(user.id);
  await ctx.reply(
    `Hello 👋\nThis is a Telegram bot to track your expenses`,
    Markup.inlineKeyboard(buildBankAccountListMenu(bankAccounts))
  );
  await ctx.answerCbQuery('Transaction was removed');
};
