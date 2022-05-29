import { Context, Markup } from 'telegraf';
import { bankRepository, userRepository } from '../../container';
import { assert } from 'ts-essentials';
import { BotCallbackQuery } from '../bot-action';
import { withCancelText } from '../with-cancel-text';
import { TransactionType } from '../../repository/transaction-repository';

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
  const bankAccount = await bankRepository.getBankAccountByShortId(
    bankAccountId
  );
  assert(ctx.callbackQuery);

  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );

  await ctx.reply(
    withCancelText(`Please select transaction type`),
    Markup.inlineKeyboard(createTransactionTypeSelectMenu())
  );

  await userRepository.setUserState(user.telegramProfile.id, {
    type: 'addingTransactionType',
    bankAccountId: bankAccount.id,
  });
};
