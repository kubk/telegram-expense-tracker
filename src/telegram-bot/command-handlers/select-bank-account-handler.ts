import { Context } from 'telegraf';
import { bankRepository } from '../../container';
import { assert } from 'ts-essentials';
import { buildBankAccountMenu } from '../menu-builders/build-bank-account-menu';

export const selectBankAccountHandler = async (ctx: Context) => {
  const bankAccountId = (ctx as any).match[1];
  if (!bankAccountId) {
    return;
  }
  const bankAccount = await bankRepository.getBankAccountById(bankAccountId);
  assert(bankAccount);
  await ctx.editMessageReplyMarkup({
    inline_keyboard: buildBankAccountMenu(bankAccount.id),
  });
};
