import { Context, Markup } from 'telegraf';
import { bankRepository, userRepository } from '../../container';
import { assert } from 'ts-essentials';
import { BotCallbackQuery } from '../bot-action';
import { withCancelText } from '../with-cancel-text';

const createTransactionTypeSelectMenu = () => {
  return [
    [
      Markup.button.callback(
        'Expense',
        BotCallbackQuery.TransactionAddManualExpense
      ),
      Markup.button.callback(
        'Top up',
        BotCallbackQuery.TransactionAddManualTopUp
      ),
    ],
  ];
};

export const transactionAddManualSelectTypeHandler = async (ctx: Context) => {
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
  assert(user.telegramProfile);

  await ctx.reply(
    withCancelText(`Please select transaction type`),
    Markup.inlineKeyboard(createTransactionTypeSelectMenu())
  );

  await userRepository.setUserState(user.telegramProfile.id, {
    type: 'addingTransactionType',
    bankAccountId: bankAccountId,
  });
};
