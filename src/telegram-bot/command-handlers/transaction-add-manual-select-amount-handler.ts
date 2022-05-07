import { Context } from 'telegraf';
import { bankRepository, userRepository } from '../../container';
import { currencyToSymbol } from '../currency-to-symbol';
import { assert } from 'ts-essentials';
import {
  isAddingTransactionType,
} from '../user-state';
import { withCancelText } from '../with-cancel-text';
import { isValidEnumValue } from '../../lib/typescript/is-valid-enum-value';
import { TransactionType } from '../../repository/transaction-repository';

export const transactionAddManualSelectAmountHandler = async (ctx: Context) => {
  assert(ctx.callbackQuery);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );
  assert(user.telegramProfile);

  const transactionType = (ctx as any).match[1];
  if (!transactionType) {
    return;
  }
  assert(isValidEnumValue(transactionType, TransactionType));

  const { state } = user.telegramProfile;

  assert(isAddingTransactionType(state));

  const bankAccount = await bankRepository.getBankAccountById(
    state.bankAccountId
  );
  assert(bankAccount);

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
