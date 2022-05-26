import { Context } from 'telegraf';
import { bankRepository } from '../../container';
import { assert } from 'ts-essentials';
import { buildBankAccountMenu } from '../menu-builders/build-bank-account-menu';

export const selectBankAccountHandler = async (ctx: Context) => {
  const bankAccountShortIdString = (ctx as any).match[1];
  if (!bankAccountShortIdString) {
    return;
  }
  const bankAccountShortId = parseInt(bankAccountShortIdString);
  await ctx.editMessageReplyMarkup({
    inline_keyboard: buildBankAccountMenu(bankAccountShortId),
  });
};
