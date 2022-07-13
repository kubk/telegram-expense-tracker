import { Context } from 'telegraf';
import { isNumber } from '../../lib/validaton/is-number';
import { isValidEnumValue } from '../../lib/typescript/is-valid-enum-value';
import {
  transactionsGetForUser,
  TransactionSortDirection,
  TransactionSortField,
  UserTransactionListFilter,
} from '../../repository/transaction-repository';
import { getDateRangeFromMonth } from '../../lib/date/get-date-range';
import { assert } from 'ts-essentials';
import { buildTransactionPaginatedResult } from '../menu-builders/build-transactions-paginated-menu';
import { bankAccountGetByShortId } from '../../repository/bank-account-repository';
import { userGetByTelegramIdOrThrow } from '../../repository/user-repository';

const getDateFilter = (year: string, groupNumber: string) => {
  return getDateRangeFromMonth(parseInt(year), parseInt(groupNumber));
};

export const transactionListHandler = async (ctx: Context) => {
  const [
    ,
    bankAccountShortIdString,
    year,
    groupNumber,
    transactionType,
    sortField,
    sortDirection,
    pageString,
  ] = (ctx as any).match;
  const page = parseInt(pageString);

  if (
    !bankAccountShortIdString ||
    !isNumber(page) ||
    !isValidEnumValue(transactionType, UserTransactionListFilter) ||
    !isValidEnumValue(sortField, TransactionSortField) ||
    !isValidEnumValue(sortDirection, TransactionSortDirection)
  ) {
    return;
  }
  const dateFilter = getDateFilter(year, groupNumber);

  assert(ctx.callbackQuery);
  const user = await userGetByTelegramIdOrThrow(ctx.callbackQuery.from.id);

  const bankAccountShortId = parseInt(bankAccountShortIdString);
  const result = await transactionsGetForUser({
    userId: user.id,
    bankAccountShortId: bankAccountShortId,
    filter: {
      dateFrom: dateFilter.from,
      dateTo: dateFilter.to,
      transactionType: transactionType,
      sortDirection,
      sortField,
    },
    pagination: {
      perPage: user.telegramProfile.perPage,
      page: page,
    },
  });

  const bankAccount = await bankAccountGetByShortId(bankAccountShortId);

  await ctx.editMessageReplyMarkup({
    inline_keyboard: buildTransactionPaginatedResult({
      transactionsPaginated: result,
      filter: transactionType,
      sortDirection,
      sortField,
      bankAccount: bankAccount,
      groupYear: parseInt(year),
      groupNumber: parseInt(groupNumber),
    }),
  });
};
