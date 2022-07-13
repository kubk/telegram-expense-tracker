import { Context, Markup } from 'telegraf';
import { assert } from 'ts-essentials';
import {
  isAddingBankAccountCurrencyState,
  isAddingBankAccountNameState,
  isAddingTransactionAmountState,
  isAddingTransactionTitleState,
  isInitialState,
} from '../user-state';
import { isValidEnumValue } from '../../lib/typescript/is-valid-enum-value';
import { Currency } from '@prisma/client';
import { buildBankAccountListMenu } from '../menu-builders/build-bank-account-list-menu';
import { isNumber } from '../../lib/validaton/is-number';
import { buildBankAccountMenu } from '../menu-builders/build-bank-account-menu';
import { withCancelText } from '../with-cancel-text';
import {
  transactionCreateManual,
  TransactionType,
} from '../../repository/transaction-repository';
import {
  bankAccountGetById,
  bankAccountCreate,
  bankAccountGetMostUsedTransactionTitles,
  bankAccountGetForUser,
} from '../../repository/bank-account-repository';
import {
  userGetByTelegramIdOrThrow,
  userSetState,
} from '../../repository/user-repository';

export const textHandler = async (ctx: Context) => {
  assert(ctx.message);
  const user = await userGetByTelegramIdOrThrow(ctx.message.from.id);
  const { state } = user.telegramProfile;

  if (isInitialState(state)) {
    await ctx.reply(
      'Unrecognized command. Type /help to see what the bot can do'
    );
  }
  if (isAddingBankAccountNameState(state)) {
    assert('text' in ctx.message);
    await userSetState(user.telegramProfile.id, {
      type: 'addingBankAccountCurrency',
      bankAccountName: ctx.message.text,
    });
    await ctx.reply(withCancelText(`Please send me the account currency`));
  }
  if (isAddingBankAccountCurrencyState(state)) {
    assert('text' in ctx.message);
    if (!isValidEnumValue(ctx.message.text, Currency)) {
      await ctx.reply('Please enter either TRY or USD');
      return;
    }
    await bankAccountCreate({
      currency: ctx.message.text,
      name: state.bankAccountName,
      familyId: user.family.id,
    });
    await userSetState(user.telegramProfile.id, {
      type: 'initial',
    });
    const bankAccounts = await bankAccountGetForUser(user.id);
    await ctx.reply(
      `Hello 👋\nThis is a Telegram bot to track your expenses`,
      Markup.inlineKeyboard(buildBankAccountListMenu(bankAccounts))
    );
  }

  if (isAddingTransactionAmountState(state)) {
    assert('text' in ctx.message);
    if (!isNumber(ctx.message.text)) {
      await ctx.reply('Please enter a valid number (only digits accepted)');
      return;
    }
    const amountWithoutSign = ctx.message.text * 100;
    const amountWithSign =
      state.transactionType === TransactionType.Expense
        ? -1 * amountWithoutSign
        : amountWithoutSign;

    await userSetState(user.telegramProfile.id, {
      type: 'addingTransactionTitle',
      bankAccountId: state.bankAccountId,
      amount: amountWithSign,
    });
    const topTransactionTitles = await bankAccountGetMostUsedTransactionTitles(
      state.bankAccountId,
      state.transactionType
    );

    const text = withCancelText(`Please type or select transaction title`);
    if (topTransactionTitles.length) {
      await ctx.reply(
        text,
        Markup.keyboard(
          topTransactionTitles.map((transaction) => transaction.title)
        ).oneTime()
      );
    } else {
      await ctx.reply(text);
    }
  }

  if (isAddingTransactionTitleState(state)) {
    const bankAccount = await bankAccountGetById(state.bankAccountId);
    assert('text' in ctx.message);
    await transactionCreateManual({
      bankAccountId: bankAccount.id,
      title: ctx.message.text,
      currency: bankAccount.currency,
      amount: state.amount,
    });
    await userSetState(user.telegramProfile.id, {
      type: 'initial',
    });
    await ctx.reply('Done!', Markup.removeKeyboard());
    await ctx.reply(
      `Hello 👋\nThis is a Telegram bot to track your expenses`,
      Markup.inlineKeyboard(buildBankAccountMenu(bankAccount.shortId))
    );
  }
};
