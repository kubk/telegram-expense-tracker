import { Context } from 'telegraf';
import { assert } from 'ts-essentials';
import { userRepository } from '../../container';
import { withCancelText } from '../with-cancel-text';

export const bankAccountAddButtonHandler = async (ctx: Context) => {
  assert(ctx.callbackQuery);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );
  assert(user.telegramProfile);
  await ctx.reply(withCancelText(`Please send me the account name`));
  await userRepository.setUserState(user.telegramProfile.id, {
    type: 'addingBankAccountName',
  });
};
