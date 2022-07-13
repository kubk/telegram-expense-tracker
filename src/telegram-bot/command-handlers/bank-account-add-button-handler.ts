import { Context } from 'telegraf';
import { assert } from 'ts-essentials';
import { withCancelText } from '../with-cancel-text';
import {
  userGetByTelegramIdOrThrow,
  userSetState,
} from '../../repository/user-repository';

export const bankAccountAddButtonHandler = async (ctx: Context) => {
  assert(ctx.callbackQuery);
  const user = await userGetByTelegramIdOrThrow(ctx.callbackQuery.from.id);
  await ctx.reply(withCancelText(`Please send me the account name`));
  await userSetState(user.telegramProfile.id, {
    type: 'addingBankAccountName',
  });
};
