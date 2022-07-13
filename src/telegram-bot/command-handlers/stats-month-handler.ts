import { Context } from 'telegraf';
import { assert } from 'ts-essentials';
import { buildMonthStatisticsMenu } from '../menu-builders/build-month-statistics-menu';
import { bankAccountGetByShortId } from '../../repository/bank-account-repository';
import { transactionsGetGroupedStatistics } from '../../repository/transaction-repository';
import { userGetByTelegramIdOrThrow } from '../../repository/user-repository';

export const statsMonthHandler = async (ctx: Context) => {
  const bankAccountShortIdString = (ctx as any).match[1];
  if (!bankAccountShortIdString) {
    return;
  }

  assert(ctx.callbackQuery);
  const user = await userGetByTelegramIdOrThrow(ctx.callbackQuery.from.id);

  const bankAccountId = parseInt(bankAccountShortIdString);
  const bankAccount = await bankAccountGetByShortId(bankAccountId);
  const transactions = await transactionsGetGroupedStatistics({
    userId: user.id,
    bankAccountId: bankAccount.id,
  });

  await ctx.editMessageReplyMarkup({
    inline_keyboard: buildMonthStatisticsMenu(transactions, bankAccount),
  });
};
