import { Context } from 'telegraf';
import { assert } from 'ts-essentials';
import { userRepository } from '../../container';
import { cancelText } from '../cancel-text';

export const bankAccountAddButtonHandler = async (ctx: Context) => {
  await ctx.answerCbQuery();
  assert(ctx.callbackQuery);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );
  assert(user.telegramProfile);
  await ctx.reply(`Please send me the account name.${cancelText}`);
  await userRepository.setUserState(user.telegramProfile.id, {
    type: 'addingBankAccountName',
  });
};
