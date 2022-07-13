import { Context } from 'telegraf';
import { currencyToSymbol } from '../currency-to-symbol';
import { assert } from 'ts-essentials';
import { isAddingTransactionType } from '../user-state';
import { withCancelText } from '../with-cancel-text';
import { isValidEnumValue } from '../../lib/typescript/is-valid-enum-value';
import { TransactionType } from '../../repository/transaction-repository';
import { bankAccountGetById } from '../../repository/bank-account-repository';
import {
  userGetByTelegramIdOrThrow,
  userSetState,
} from '../../repository/user-repository';

export const transactionAddManualSelectAmountHandler = async (ctx: Context) => {
  assert(ctx.callbackQuery);
  const user = await userGetByTelegramIdOrThrow(ctx.callbackQuery.from.id);

  const transactionType = (ctx as any).match[1];
  if (!transactionType) {
    return;
  }
  assert(isValidEnumValue(transactionType, TransactionType));

  const { state } = user.telegramProfile;

  assert(isAddingTransactionType(state));

  const bankAccount = await bankAccountGetById(state.bankAccountId);

  await ctx.reply(
    withCancelText(
      `Please send me amount in ${currencyToSymbol(bankAccount.currency)}`
    )
  );

  await userSetState(user.telegramProfile.id, {
    type: 'addingTransactionAmount',
    bankAccountId: bankAccount.id,
    transactionType: transactionType,
  });
};
