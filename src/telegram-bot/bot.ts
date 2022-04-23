import { Markup } from 'telegraf';
import {
  bankRepository,
  bot,
  transactionRepository,
  userRepository,
} from '../container';
import { assert, UnreachableCaseError } from 'ts-essentials';
import { BotButtons } from './bot-action';
import {
  isAddingBankAccountCurrencyState,
  isAddingBankAccountNameState,
  isAddingTransactionAmountState,
  isAddingTransactionTitleState,
  isInitialState,
} from './user-state';
import { buildMonthStatistics, buildWeekStatistics } from './build-statistics';
import { isNumber } from '../utils/is-number';
import { currencyToSymbol } from './currency-to-symbol';
import { Currency } from '@prisma/client';
import { isValidEnumValue } from '../lib/is-valid-enum-value';
import { buildBankAccountListMenu } from './build-bank-account-list-menu';
import { buildBankAccountMenu } from './build-bank-account-menu';
import { UserTransactionListFilter } from '../repository/transaction-repository';
import {
  getDateRangeFromMonth,
  getDateRangeFromWeek,
} from '../lib/get-date-range';

const cancelText = '\n\nOr click /cancel to cancel the operation';

bot.command('start', async (ctx) => {
  await userRepository.createUserIfNotExists(ctx.message.from.id);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.message.from.id
  );
  const bankAccounts = await bankRepository.getUserBankAccounts(user.id);
  await ctx.reply(
    `Hello 👋\nThis is a Telegram bot to track your expenses`,
    Markup.inlineKeyboard(buildBankAccountListMenu(bankAccounts))
  );
});

bot.command('cancel', async (ctx) => {
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.message.from.id
  );
  assert(user.telegramProfile);
  await userRepository.setUserState(user.telegramProfile.id, {
    type: 'initial',
  });

  const bankAccounts = await bankRepository.getUserBankAccounts(user.id);
  await ctx.reply(
    `Hello 👋\nThis is a Telegram bot to track your expenses`,
    Markup.inlineKeyboard(buildBankAccountListMenu(bankAccounts))
  );
});

bot.action(BotButtons.BankAccountListButton, async (ctx) => {
  await ctx.answerCbQuery();
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );
  const bankAccounts = await bankRepository.getUserBankAccounts(user.id);
  await ctx.editMessageReplyMarkup({
    inline_keyboard: buildBankAccountListMenu(bankAccounts),
  });
});

bot.action(BotButtons.BankAccountAddButton, async (ctx) => {
  await ctx.answerCbQuery();
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );
  assert(user.telegramProfile);
  await ctx.reply(`Please send me the account name.${cancelText}`);
  await userRepository.setUserState(user.telegramProfile.id, {
    type: 'addingBankAccountName',
  });
});

bot.action(/select_bank_account:(.+)/, async (ctx) => {
  const bankAccountId = ctx.match[1];
  if (!bankAccountId) {
    return;
  }
  const bankAccount = await bankRepository.getBankAccountById(bankAccountId);
  assert(bankAccount);
  await ctx.editMessageReplyMarkup({
    inline_keyboard: buildBankAccountMenu(bankAccount.id),
  });
});

bot.action(/stats_months:(.+)/, async (ctx) => {
  const bankAccountId = ctx.match[1];
  if (!bankAccountId) {
    return;
  }

  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );

  const bankAccount = await bankRepository.getBankAccountById(bankAccountId);
  assert(bankAccount);
  const transactions =
    await transactionRepository.getUserTransactionsExpensesGrouped({
      userId: user.id,
      bankAccountId: bankAccountId,
      type: 'monthly',
    });

  await ctx.editMessageReplyMarkup({
    inline_keyboard: buildMonthStatistics(transactions, bankAccount),
  });
});

bot.action(/stats_weeks:(.+)/, async (ctx) => {
  const bankAccountId = ctx.match[1];
  if (!bankAccountId) {
    return;
  }

  const bankAccount = await bankRepository.getBankAccountById(bankAccountId);
  assert(bankAccount);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );
  const transactions =
    await transactionRepository.getUserTransactionsExpensesGrouped({
      userId: user.id,
      bankAccountId: bankAccountId,
      type: 'weekly',
    });

  await ctx.editMessageReplyMarkup({
    inline_keyboard: buildWeekStatistics(transactions, bankAccount),
  });
});

bot.action(/(week|month):(.+):(\d{4}):(\d+):(.+)/, async (ctx) => {
  const [, statisticsType, bankAccountId, year, groupNumber, transactionType] =
    ctx.match;
  if (!bankAccountId) {
    return;
  }
  if (!isValidEnumValue(transactionType, UserTransactionListFilter)) {
    return;
  }
  const dateFilter = (() => {
    switch (statisticsType) {
      case 'week':
        return getDateRangeFromWeek(parseInt(year), parseInt(groupNumber));
      case 'month':
        return getDateRangeFromMonth(parseInt(year), parseInt(groupNumber));
      default:
        throw new Error('Invalid statistic type' + statisticsType);
    }
  })();

  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );

  const result = await transactionRepository.getUserTransactionList({
    userId: user.id,
    bankAccountId: bankAccountId,
    filter: {
      dateFrom: dateFilter.from,
      dateTo: dateFilter.to,
      // @ts-expect-error
      transactionType: transactionType,
    },
    pagination: {
      perPage: 10,
      page: 1,
    },
  });

  console.log(result);
});

bot.action(/transaction_add_manual:(.+)/, async (ctx) => {
  const bankAccountId = ctx.match[1];
  if (!bankAccountId) {
    return;
  }

  const bankAccount = await bankRepository.getBankAccountById(bankAccountId);
  assert(bankAccount);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );
  assert(user.telegramProfile);
  await ctx.reply(
    `Please send me amount in ${currencyToSymbol(
      bankAccount.currency
    )}. A positive value for income, a negative values is for outcome\nExamples:\n1000\n-500${cancelText}`
  );
  await userRepository.setUserState(user.telegramProfile.id, {
    type: 'addingTransactionAmount',
    bankAccountId: bankAccountId,
  });
});

bot.on('text', async (ctx) => {
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
    await userRepository.setUserState(user.telegramProfile.id, {
      type: 'addingBankAccountCurrency',
      bankAccountName: ctx.message.text,
    });
    await ctx.reply(`Please send me the account currency.${cancelText}`);
  }
  if (isAddingBankAccountCurrencyState(state)) {
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
    if (!isNumber(ctx.message.text)) {
      await ctx.reply('Please enter a valid number (only digits accepted)');
      return;
    }
    await userRepository.setUserState(user.telegramProfile.id, {
      type: 'addingTransactionTitle',
      bankAccountId: state.bankAccountId,
      amount: ctx.message.text * 100,
    });
    await ctx.reply(
      `Please enter transaction title. Examples:
Rent
Taxi${cancelText}`
    );
  }

  if (isAddingTransactionTitleState(state)) {
    const bankAccount = await bankRepository.getBankAccountById(
      state.bankAccountId
    );
    assert(bankAccount);
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
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
