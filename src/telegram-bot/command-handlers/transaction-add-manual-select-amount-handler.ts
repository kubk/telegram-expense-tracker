import { Context } from 'telegraf';
import { bankRepository, userRepository } from '../../container';
import { currencyToSymbol } from '../currency-to-symbol';
import { assert } from 'ts-essentials';
import { isAddingTransactionType } from '../user-state';
import { withCancelText } from '../with-cancel-text';
import { isValidEnumValue } from '../../lib/typescript/is-valid-enum-value';
import { TransactionType } from '../../repository/transaction-repository';
import { getBankAccountById } from '../../repository/bank-account-repository';

export const transactionAddManualSelectAmountHandler = async (ctx: Context) => {
  assert(ctx.callbackQuery);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );

  const transactionType = (ctx as any).match[1];
  if (!transactionType) {
    return;
  }
  assert(isValidEnumValue(transactionType, TransactionType));

  const { state } = user.telegramProfile;

  assert(isAddingTransactionType(state));

  const bankAccount = await getBankAccountById(state.bankAccountId);

  await ctx.reply(
    withCancelText(
      `Please send me amount in ${currencyToSymbol(bankAccount.currency)}`
    )
  );

  await userRepository.setUserState(user.telegramProfile.id, {
    type: 'addingTransactionAmount',
    bankAccountId: bankAccount.id,
    transactionType: transactionType,
  });
};
