import { Context } from 'telegraf';
import { isNumber } from '../../lib/validaton/is-number';
import { isValidEnumValue } from '../../lib/typescript/is-valid-enum-value';
import {
  StatisticGroupByType,
  TransactionSortDirection,
  TransactionSortField,
  UserTransactionListFilter,
} from '../../repository/transaction-repository';
import {
  getDateRangeFromMonth,
  getDateRangeFromWeek,
} from '../../lib/date/get-date-range';
import { assert } from 'ts-essentials';
import {
  bankRepository,
  transactionRepository,
  userRepository,
} from '../../container';
import { buildTransactionPaginatedResult } from '../menu-builders/build-transactions-paginated-menu';

const getDateFilter = (
  statisticsType: StatisticGroupByType,
  year: string,
  groupNumber: string
) => {
  switch (statisticsType) {
    case StatisticGroupByType.Week:
      return getDateRangeFromWeek(parseInt(year), parseInt(groupNumber));
    case StatisticGroupByType.Month:
      return getDateRangeFromMonth(parseInt(year), parseInt(groupNumber));
    default:
      throw new Error(`Invalid statistic type${statisticsType}`);
  }
};

export const transactionListHandler = async (ctx: Context) => {
  const [
    ,
    statisticsType,
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
    !isValidEnumValue(statisticsType, StatisticGroupByType) ||
    !isValidEnumValue(sortField, TransactionSortField) ||
    !isValidEnumValue(sortDirection, TransactionSortDirection)
  ) {
    return;
  }
  const dateFilter = getDateFilter(statisticsType, year, groupNumber);

  assert(ctx.callbackQuery);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );

  const bankAccountShortId = parseInt(bankAccountShortIdString);
  const result = await transactionRepository.getUserTransactionList({
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

  const bankAccount = await bankRepository.getBankAccountByShortId(
    bankAccountShortId
  );

  await ctx.editMessageReplyMarkup({
    inline_keyboard: buildTransactionPaginatedResult({
      transactionsPaginated: result,
      type: statisticsType,
      filter: transactionType,
      sortDirection,
      sortField,
      transactionTitleFilters: bankAccount.filters,
      bankAccount: bankAccount,
      groupYear: parseInt(year),
      groupNumber: parseInt(groupNumber),
    }),
  });
};
