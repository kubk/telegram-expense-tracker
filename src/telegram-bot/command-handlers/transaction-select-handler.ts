import { Context, Markup } from 'telegraf';
import { assert } from 'ts-essentials';
import { buildTransactionPageMenu } from '../menu-builders/build-transaction-page-menu';
import { DateTime } from 'luxon';
import { formatMoney } from '../format-money';
import { Currency, Transaction } from '@prisma/client';
import {
  FilterTransactionState,
  generateTransactionListLink,
} from '../menu-builders/generate-transaction-list-link';
import { BotCallbackQuery } from '../bot-action';
import { convertCurrency } from '../../currency-converter/convert-currency';
import {
  FilterTransactionIsCountable,
  FilterTransactionSource,
  transactionGetByShortId,
  TransactionSortDirection,
  TransactionSortField,
  transactionToggleCountable,
  transactionToggleType,
  UserTransactionListFilter,
} from '../../repository/transaction-repository';
import { isNumber } from '../../lib/validaton/is-number';
import { isValidEnumValue } from '../../lib/typescript/is-valid-enum-value';

const formatAsUsd = async (transaction: Transaction) => {
  switch (transaction.currency) {
    case Currency.EUR:
    case Currency.RUB:
    case Currency.TRY: {
      const converted = await convertCurrency(
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
  const [
    currentPageLink,
    transactionShortIdString,
    bankAccountShortId,
    year,
    groupNumber,
    transactionType,
    sortField,
    sortDirection,
    filterState,
    filterSource,
    filterCountable,
    pageString,
    action,
  ] = (ctx as any).match;
  const page = parseInt(pageString);

  if (!transactionShortIdString) {
    return;
  }
  const transactionShortId = parseInt(transactionShortIdString);

  if (action === BotCallbackQuery.TransactionTypeToggle) {
    await transactionToggleType(transactionShortId);
  }
  if (action === BotCallbackQuery.TransactionIsCountableToggle) {
    await transactionToggleCountable(transactionShortId);
  }

  if (
    !isNumber(page) ||
    !isValidEnumValue(transactionType, UserTransactionListFilter) ||
    !isValidEnumValue(sortField, TransactionSortField) ||
    !isValidEnumValue(sortDirection, TransactionSortDirection) ||
    !isValidEnumValue(filterState, FilterTransactionState) ||
    !isValidEnumValue(filterSource, FilterTransactionSource) ||
    !isValidEnumValue(filterCountable, FilterTransactionIsCountable)
  ) {
    return;
  }

  const transaction = await transactionGetByShortId(transactionShortId);
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
    Markup.inlineKeyboard(
      buildTransactionPageMenu({
        transaction,
        currentPageLink,
        action,
        backLink: generateTransactionListLink({
          bankAccountShortId: bankAccountShortId,
          page,
          sortField,
          sortDirection,
          groupYear: year,
          groupNumber,
          filters: {
            transactionType,
            filterState,
            filterSource,
            filterCountable,
          },
        }),
      })
    )
  );
};
