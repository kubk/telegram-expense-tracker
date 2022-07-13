import { Context, Markup } from 'telegraf';
import { assert } from 'ts-essentials';
import { BotCallbackQuery } from '../bot-action';
import { withCancelText } from '../with-cancel-text';
import { TransactionType } from '../../repository/transaction-repository';
import { bankAccountGetByShortId } from '../../repository/bank-account-repository';
import {
  userGetByTelegramIdOrThrow,
  userSetState,
} from '../../repository/user-repository';

const createTransactionTypeSelectMenu = () => {
  return [
    [
      Markup.button.callback(
        'Expense',
        `${BotCallbackQuery.TransactionAddManualAmount}:${TransactionType.Expense}`
      ),
      Markup.button.callback(
        'Top up',
        `${BotCallbackQuery.TransactionAddManualAmount}:${TransactionType.TopUp}`
      ),
    ],
  ];
};

export const transactionAddManualSelectTypeHandler = async (ctx: Context) => {
  const bankAccountShortIdString = (ctx as any).match[1];
  if (!bankAccountShortIdString) {
    return;
  }

  const bankAccountId = parseInt(bankAccountShortIdString);
  const bankAccount = await bankAccountGetByShortId(bankAccountId);
  assert(ctx.callbackQuery);

  const user = await userGetByTelegramIdOrThrow(ctx.callbackQuery.from.id);

  await ctx.reply(
    withCancelText(`Please select transaction type`),
    Markup.inlineKeyboard(createTransactionTypeSelectMenu())
  );

  await userSetState(user.telegramProfile.id, {
    type: 'addingTransactionType',
    bankAccountId: bankAccount.id,
  });
};
