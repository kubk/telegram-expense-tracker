import { Context, Markup } from 'telegraf';
import { transactionRepository } from '../../container';
import { assert } from 'ts-essentials';
import { buildTransactionPageMenu } from '../menu-builders/build-transaction-page-menu';
import { DateTime } from 'luxon';
import { formatMoney } from '../format-money';

export const selectTransactionHandler = async (ctx: Context) => {
  const transactionId = (ctx as any).match[1];
  if (!transactionId) {
    return;
  }
  const transaction = await transactionRepository.getTransaction(transactionId);
  assert(transaction);
  await ctx.deleteMessage();

  // TODO: get locale from user
  await ctx.reply(
    `${transaction.title}
${DateTime.fromJSDate(transaction.createdAt)
  .setLocale('ru')
  .toLocaleString(DateTime.DATETIME_SHORT)}
${formatMoney(transaction.amount, transaction.currency)} (${Math.ceil(
      transaction.amount / 100 / 14.9
    )}$)
`,
    Markup.inlineKeyboard(buildTransactionPageMenu(transaction))
  );
};
