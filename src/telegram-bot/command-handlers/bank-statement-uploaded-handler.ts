import { Context, Markup } from 'telegraf';
import axios from 'axios';
import { parseTransactions } from '../../bank-statement-parser/yapi-kredi-parser/parse-transactions';
import { assert } from 'ts-essentials';
import { isUploadingBankStatement } from '../user-state';
import { buildBankAccountListMenu } from '../menu-builders/build-bank-account-list-menu';
import {
  bankAccountGetByShortId,
  bankAccountGetForUser,
} from '../../repository/bank-account-repository';
import { transactionsImport } from '../../repository/transaction-repository';
import {
  userGetByTelegramIdOrThrow,
  userSetState,
} from '../../repository/user-repository';

const getTemporaryTelegramFileContents = async (ctx: Context) => {
  // @ts-expect-error It looks like Telegraf typings are outdated
  const fileId = ctx.update.message.document.file_id;

  const fileUrl = await ctx.telegram.getFileLink(fileId);
  const response = await axios.get(fileUrl.toString(), {
    responseType: 'arraybuffer',
  });

  return Buffer.from(response.data, 'utf-8');
};

export const bankStatementUploadedHandler = async (ctx: Context) => {
  assert(ctx.message);
  const user = await userGetByTelegramIdOrThrow(ctx.message.from.id);
  const { state } = user.telegramProfile;
  assert(isUploadingBankStatement(state));

  const parsedTransactions = await parseTransactions(
    await getTemporaryTelegramFileContents(ctx)
  );

  const bankAccount = await bankAccountGetByShortId(state.bankAccountShortId);

  const result = await transactionsImport(bankAccount.id, parsedTransactions);

  await ctx.reply(`Transaction list has been imported.
Added transactions: ${result.added}
Removed transactions: ${result.removed}
`);

  await userSetState(user.telegramProfile.id, {
    type: 'initial',
  });
  const bankAccounts = await bankAccountGetForUser(user.id);
  await ctx.reply(
    `Hello 👋\nThis is a Telegram bot to track your expenses`,
    Markup.inlineKeyboard(buildBankAccountListMenu(bankAccounts))
  );
};
