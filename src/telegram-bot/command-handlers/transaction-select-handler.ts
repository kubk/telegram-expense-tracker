import { Context, Markup } from 'telegraf';
import { transactionRepository } from '../../container';
import { assert } from 'ts-essentials';
import { buildTransactionPageMenu } from '../menu-builders/build-transaction-page-menu';
import { DateTime } from 'luxon';
import { formatMoney } from '../format-money';
import { Currency, Transaction } from '@prisma/client';
import { getCurrencyAmountInUsd } from '../../currency-converter/get-currency-amount-in-usd';

const formatAsUsd = async (transaction: Transaction) => {
  switch (transaction.currency) {
    case Currency.TRY: {
      const converted = await getCurrencyAmountInUsd(
        transaction.currency,
        transaction.amount,
        DateTime.fromJSDate(transaction.createdAt)
      );
      return `(${formatMoney(
        { amount: converted.amount, currency: converted.currency },
        { asFloat: true }
      )})`;
    }
    case Currency.USD:
      return '';
  }
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
    console.error(`Unable to delete message`, e);
  }

  const asUsd = await formatAsUsd(transaction);

  await ctx.reply(
    `${transaction.title}
${DateTime.fromJSDate(transaction.createdAt)
  .setLocale('ru')
  .toLocaleString(DateTime.DATETIME_SHORT)}
${formatMoney(
  { amount: transaction.amount, currency: transaction.currency },
  { asFloat: true }
)} ${asUsd}
`,
    Markup.inlineKeyboard(buildTransactionPageMenu(transaction))
  );
};
