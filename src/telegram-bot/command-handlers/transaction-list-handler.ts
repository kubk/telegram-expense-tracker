import { Context } from 'telegraf';
import { isNumber } from '../../lib/validaton/is-number';
import { isValidEnumValue } from '../../lib/typescript/is-valid-enum-value';
import {
  FilterTransactionIsCountable,
  FilterTransactionSource,
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
import { FilterTransactionState } from '../menu-builders/generate-transaction-list-link';
import { buildTransactionFilterMenu } from '../menu-builders/buld-transaction-filter-menu';

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
    filterState,
    filterSource,
    filterCountable,
    pageString,
  ] = (ctx as any).match;
  const page = parseInt(pageString);

  if (
    !bankAccountShortIdString ||
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

  const dateFilter = getDateFilter(year, groupNumber);

  assert(ctx.callbackQuery);
  const user = await userGetByTelegramIdOrThrow(ctx.callbackQuery.from.id);

  const bankAccountShortId = parseInt(bankAccountShortIdString);

  const filters = {
    filterState,
    transactionType,
    filterSource,
    filterCountable,
  };

  if (filterState === FilterTransactionState.Applied) {
    const result = await transactionsGetForUser({
      userId: user.id,
      bankAccountShortId: bankAccountShortId,
      filter: {
        dateFrom: dateFilter.from,
        dateTo: dateFilter.to,
        transactionType,
        filterSource,
        filterCountable,
        sortDirection,
        sortField,
      },
      pagination: {
        perPage: user.telegramProfile.perPage,
        page,
      },
    });

    const bankAccount = await bankAccountGetByShortId(bankAccountShortId);

    await ctx.editMessageReplyMarkup({
      inline_keyboard: buildTransactionPaginatedResult({
        transactionsPaginated: result,
        filters,
        sortDirection,
        sortField,
        bankAccount: bankAccount,
        groupYear: parseInt(year),
        groupNumber: parseInt(groupNumber),
      }),
    });
  }

  if (filterState === FilterTransactionState.Changing) {
    await ctx.editMessageReplyMarkup({
      inline_keyboard: buildTransactionFilterMenu(filters, {
        bankAccountShortId,
        page,
        groupNumber: parseInt(groupNumber),
        groupYear: parseInt(year),
        sortDirection,
        sortField,
      }),
    });
  }
};
