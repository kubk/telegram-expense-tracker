import { assert } from 'ts-essentials';
import { userRepository } from '../../container';
import { withCancelText } from '../with-cancel-text';
import { Context } from 'telegraf';

export const goToUploadBankStatementHandler = async (ctx: Context) => {
  const bankAccountId = (ctx as any).match[1];
  if (!bankAccountId) {
    return;
  }

  assert(ctx.callbackQuery);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );
  assert(user.telegramProfile);

  await userRepository.setUserState(user.telegramProfile.id, {
    type: 'uploadingBankStatement',
    bankAccountId: bankAccountId,
  });

  await ctx.reply(withCancelText('Please upload a bank statement'));
};
