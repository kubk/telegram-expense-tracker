import { Context, Markup } from 'telegraf';
import { assert } from 'ts-essentials';
import {
  bankRepository,
  transactionRepository,
  userRepository,
} from '../../container';
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
import { TransactionType } from '../../repository/transaction-repository';

export const textHandler = async (ctx: Context) => {
  assert(ctx.message);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.message.from.id
  );
  assert(user.telegramProfile);
  const { state } = user.telegramProfile;

  if (isInitialState(state)) {
    await ctx.reply(
      'Unrecognized command. Type /help to see what the bot can do'
    );
  }
  if (isAddingBankAccountNameState(state)) {
    assert('text' in ctx.message);
    await userRepository.setUserState(user.telegramProfile.id, {
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
    await bankRepository.createBankAccount({
      currency: ctx.message.text,
      name: state.bankAccountName,
      familyId: user.family.id,
    });
    await userRepository.setUserState(user.telegramProfile.id, {
      type: 'initial',
    });
    const bankAccounts = await bankRepository.getUserBankAccounts(user.id);
    await ctx.reply(
      `Done 👍\nThe bank account has been added`,
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

    await userRepository.setUserState(user.telegramProfile.id, {
      type: 'addingTransactionTitle',
      bankAccountId: state.bankAccountId,
      amount: amountWithSign,
    });
    await ctx.reply(
      withCancelText(`Please enter transaction title. Examples:
Rent
Taxi`)
    );
  }

  if (isAddingTransactionTitleState(state)) {
    const bankAccount = await bankRepository.getBankAccountById(
      state.bankAccountId
    );
    assert(bankAccount);
    assert('text' in ctx.message);
    await transactionRepository.createManualTransaction({
      bankAccountId: bankAccount.id,
      title: ctx.message.text,
      currency: bankAccount.currency,
      amount: state.amount,
    });
    await userRepository.setUserState(user.telegramProfile.id, {
      type: 'initial',
    });
    await ctx.reply(
      `Hello 👋\nThis is a Telegram bot to track your expenses`,
      Markup.inlineKeyboard(buildBankAccountMenu(bankAccount.id))
    );
  }
};
