import { Context, Markup } from 'telegraf';
import axios from 'axios';
import { parseTransactions } from '../../bank-statement-parser/yapi-kredi-parser/parse-transactions';
import {
  bankRepository,
  transactionRepository,
  userRepository,
} from '../../container';
import { assert } from 'ts-essentials';
import { isUploadingBankStatement } from '../user-state';
import { buildBankAccountListMenu } from '../menu-builders/build-bank-account-list-menu';

export const bankStatementUploadedHandler = async (ctx: Context) => {
  assert(ctx.message);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.message.from.id
  );
  assert(user.telegramProfile);
  const { state } = user.telegramProfile;
  assert(isUploadingBankStatement(state));

  // @ts-expect-error It looks like Telegraf typings are outdated
  const fileId = ctx.update.message.document.file_id;

  const fileUrl = await ctx.telegram.getFileLink(fileId);
  const response = await axios.get(fileUrl.toString(), {
    responseType: 'arraybuffer',
  });
  const buffer = Buffer.from(response.data, 'utf-8');
  const parsedTransactions = await parseTransactions(buffer);

  const result = await transactionRepository.importTransactions(
    state.bankAccountId,
    parsedTransactions.map((item) => ({
      ...item,
      bankAccountId: state.bankAccountId,
    }))
  );

  await ctx.reply(`Transaction list has been imported.
Added transactions: ${result.added}
Removed transactions: ${result.removed}
`);

  await userRepository.setUserState(user.telegramProfile.id, {
    type: 'initial',
  });
  const bankAccounts = await bankRepository.getUserBankAccounts(user.id);
  await ctx.reply(
    `Hello 👋\nThis is a Telegram bot to track your expenses`,
    Markup.inlineKeyboard(buildBankAccountListMenu(bankAccounts))
  );
};
