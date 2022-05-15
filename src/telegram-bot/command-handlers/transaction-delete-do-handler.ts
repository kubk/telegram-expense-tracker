import { Context, Markup } from 'telegraf';
import {
  bankRepository,
  transactionRepository,
  userRepository,
} from '../../container';
import { assert } from 'ts-essentials';
import { buildBankAccountListMenu } from '../menu-builders/build-bank-account-list-menu';

export const transactionDeleteDoHandler = async (ctx: Context) => {
  const transactionId = (ctx as any).match[1];
  if (!transactionId) {
    return;
  }
  await transactionRepository.deleteTransaction(transactionId);
  await ctx.deleteMessage();

  assert(ctx.callbackQuery);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );
  const bankAccounts = await bankRepository.getUserBankAccounts(user.id);
  await ctx.reply(
    `Hello 👋\nThis is a Telegram bot to track your expenses`,
    Markup.inlineKeyboard(buildBankAccountListMenu(bankAccounts))
  );
  await ctx.answerCbQuery('Transaction was removed');
};
