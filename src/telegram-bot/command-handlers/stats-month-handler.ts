import { Context } from 'telegraf';
import { assert } from 'ts-essentials';
import {
  bankRepository,
  transactionRepository,
  userRepository,
} from '../../container';
import { buildMonthStatisticsMenu } from '../menu-builders/build-month-statistics-menu';

export const statsMonthHandler = async (ctx: Context) => {
  const bankAccountShortIdString = (ctx as any).match[1];
  if (!bankAccountShortIdString) {
    return;
  }

  assert(ctx.callbackQuery);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );

  const bankAccountId = parseInt(bankAccountShortIdString);
  const bankAccount = await bankRepository.getBankAccountByShortId(
    bankAccountId
  );
  const transactions =
    await transactionRepository.getUserTransactionsExpensesGrouped({
      userId: user.id,
      bankAccountId: bankAccount.id,
    });

  await ctx.editMessageReplyMarkup({
    inline_keyboard: buildMonthStatisticsMenu(transactions, bankAccount),
  });
};
