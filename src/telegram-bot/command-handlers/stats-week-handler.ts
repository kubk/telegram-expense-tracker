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
  const bankAccountId = (ctx as any).match[1];
  if (!bankAccountId) {
    return;
  }

  const bankAccount = await bankRepository.getBankAccountById(bankAccountId);
  assert(bankAccount);
  assert(ctx.callbackQuery);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );
  const transactions =
    await transactionRepository.getUserTransactionsExpensesGrouped({
      userId: user.id,
      bankAccountId: bankAccountId,
      type: StatisticGroupByType.Week,
    });

  await ctx.editMessageReplyMarkup({
    inline_keyboard: buildWeekStatisticsMenu(transactions, bankAccount),
  });
};
