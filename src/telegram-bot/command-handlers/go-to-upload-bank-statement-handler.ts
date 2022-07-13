import { assert } from 'ts-essentials';
import { withCancelText } from '../with-cancel-text';
import { Context } from 'telegraf';
import {
  userGetByTelegramIdOrThrow,
  userSetState,
} from '../../repository/user-repository';

export const goToUploadBankStatementHandler = async (ctx: Context) => {
  const bankAccountShortIdString = (ctx as any).match[1];
  if (!bankAccountShortIdString) {
    return;
  }

  const bankAccountShortId = parseInt(bankAccountShortIdString);
  assert(ctx.callbackQuery);
  const user = await userGetByTelegramIdOrThrow(ctx.callbackQuery.from.id);

  await userSetState(user.telegramProfile.id, {
    type: 'uploadingBankStatement',
    bankAccountShortId,
  });

  await ctx.reply(withCancelText('Please upload a bank statement'));
};
