import { Context } from 'telegraf';
import { bankRepository, userRepository } from '../../container';
import { assert } from 'ts-essentials';
import { currencyToSymbol } from '../currency-to-symbol';
import { cancelText } from '../cancel-text';

export let transactionAddManualHandler = async (ctx: Context) => {
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
    `Please send me amount in ${currencyToSymbol(
      bankAccount.currency
    )}. A positive value for income, a negative values is for outcome\nExamples:\n1000\n-500${cancelText}`
  );
  await userRepository.setUserState(user.telegramProfile.id, {
    type: 'addingTransactionAmount',
    bankAccountId: bankAccountId,
  });
};
