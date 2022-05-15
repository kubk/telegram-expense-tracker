import { Context, Markup } from 'telegraf';
import { transactionRepository } from '../../container';
import { assert } from 'ts-essentials';
import { buildTransactionDeleteMenu } from '../menu-builders/build-transaction-delete-menu';

export const transactionDeleteAskHandler = async (ctx: Context) => {
  const transactionId = (ctx as any).match[1];
  if (!transactionId) {
    return;
  }
  const transaction = await transactionRepository.getTransaction(transactionId);
  assert(transaction);
  await ctx.deleteMessage();

  await ctx.reply(
    `Are you sure you want to delete this transaction?

${transaction.title}`,
    Markup.inlineKeyboard(buildTransactionDeleteMenu(transaction))
  );
};
