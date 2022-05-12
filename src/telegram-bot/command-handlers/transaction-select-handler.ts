import { Context, Markup } from 'telegraf';
import { transactionRepository } from '../../container';
import { assert } from 'ts-essentials';
import { buildTransactionPageMenu } from '../menu-builders/build-transaction-page-menu';
import { DateTime } from 'luxon';
import { formatMoney } from '../format-money';
import { currencyConvert } from '../../currency-converter/currency-convert';
import { Currency, Transaction } from '@prisma/client';

const getMoneyUsdFormatted = (transaction: Transaction) => {
  const moneyUsd =
    transaction.currency === Currency.TRY
      ? currencyConvert(transaction.amount, transaction.currency, Currency.USD)
      : null;

  return moneyUsd ? `(${formatMoney(moneyUsd.amount, moneyUsd.currency)})` : '';
};

export const transactionSelectHandler = async (ctx: Context) => {
  const transactionId = (ctx as any).match[1];
  if (!transactionId) {
    return;
  }
  const transaction = await transactionRepository.getTransaction(transactionId);
  assert(transaction);
  try {
    await ctx.deleteMessage();
  } catch (e) {
    console.error(`Unable to delete message`, e)
  }

  // TODO: get locale from user
  await ctx.reply(
    `${transaction.title}
${DateTime.fromJSDate(transaction.createdAt)
  .setLocale('ru')
  .toLocaleString(DateTime.DATETIME_SHORT)}
${formatMoney(transaction.amount, transaction.currency)} ${getMoneyUsdFormatted(
      transaction
    )}
`,
    Markup.inlineKeyboard(buildTransactionPageMenu(transaction))
  );
};
