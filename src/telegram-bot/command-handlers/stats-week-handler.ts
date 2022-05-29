import { Context } from 'telegraf';
import {
  bankRepository,
  transactionRepository,
  userRepository,
} from '../../container';
import { assert } from 'ts-essentials';
import { StatisticGroupByType } from '../../repository/transaction-repository';
import { buildWeekStatisticsMenu } from '../menu-builders/build-week-statistics-menu';

export const statsWeekHandler = async (ctx: Context) => {
  const bankAccountShortIdString = (ctx as any).match[1];
  if (!bankAccountShortIdString) {
    return;
  }
  const bankAccountId = parseInt(bankAccountShortIdString);
  const bankAccount = await bankRepository.getBankAccountByShortId(
    bankAccountId
  );
  assert(ctx.callbackQuery);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );

  const transactions =
    await transactionRepository.getUserTransactionsExpensesGrouped({
      userId: user.id,
      bankAccountId: bankAccount.id,
      type: StatisticGroupByType.Week,
    });

  await ctx.editMessageReplyMarkup({
    inline_keyboard: buildWeekStatisticsMenu(transactions, bankAccount),
  });
};
