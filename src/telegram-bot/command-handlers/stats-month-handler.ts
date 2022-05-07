import { Context } from 'telegraf';
import { assert } from 'ts-essentials';
import {
  bankRepository,
  transactionRepository,
  userRepository,
} from '../../container';
import { StatisticGroupByType } from '../../repository/transaction-repository';
import { buildMonthStatisticsMenu } from '../menu-builders/build-month-statistics-menu';

export const statsMonthHandler = async (ctx: Context) => {
  const bankAccountId = (ctx as any).match[1];
  if (!bankAccountId) {
    return;
  }

  assert(ctx.callbackQuery);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );

  const bankAccount = await bankRepository.getBankAccountById(bankAccountId);
  assert(bankAccount);
  const transactions =
    await transactionRepository.getUserTransactionsExpensesGrouped({
      userId: user.id,
      bankAccountId: bankAccountId,
      type: StatisticGroupByType.Month,
    });

  await ctx.editMessageReplyMarkup({
    inline_keyboard: buildMonthStatisticsMenu(transactions, bankAccount),
  });
};
