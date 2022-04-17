import { Markup, Telegraf } from 'telegraf';
import { getEnvSafe } from '../utils/get-env-safe';
import {
  bankRepository,
  transactionRepository,
  userRepository,
} from '../container';
import { assert } from 'ts-essentials';
import { currencyToSymbol, isValidCurrency } from './currency-to-symbol';
import { BotAction } from './bot-action';
import {
  isAddingBankAccountCurrencyState,
  isAddingBankAccountNameState,
  isAddingTransactionAmountState,
  isAddingTransactionTitleState,
  isInitialState,
} from './user-state';
import {
  buildBankAccountListMenu,
  buildBankAccountMenu,
  buildMonthStatistics,
  buildWeekStatistics,
} from './button-builders';
import { isNumber } from '../utils/is-number';

const logTelegram = false;
const bot = new Telegraf(getEnvSafe('TELEGRAM_BOT_TOKEN'));
if (logTelegram) {
  bot.use(Telegraf.log());
}

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

bot.action(BotAction.BankAccountList, async (ctx) => {
  await ctx.answerCbQuery();
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );
  const bankAccounts = await bankRepository.getUserBankAccounts(user.id);
  await ctx.editMessageReplyMarkup({
    inline_keyboard: buildBankAccountListMenu(bankAccounts),
  });
});

bot.action(BotAction.BankAccountAdd, async (ctx) => {
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

bot.action(/statistic_months:(.+)/, async (ctx) => {
  const bankAccountId = ctx.match[1];
  if (!bankAccountId) {
    return;
  }

  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );

  const bankAccount = await bankRepository.getBankAccountById(bankAccountId);
  assert(bankAccount);
  const transactions = await transactionRepository.getUserTransactionsExpenses({
    userId: user.id,
    bankAccountId: bankAccountId,
    type: 'monthly',
  });

  await ctx.editMessageReplyMarkup({
    inline_keyboard: buildMonthStatistics(transactions, bankAccount),
  });
});

bot.action(/statistic_weeks:(.+)/, async (ctx) => {
  const bankAccountId = ctx.match[1];
  if (!bankAccountId) {
    return;
  }

  const bankAccount = await bankRepository.getBankAccountById(bankAccountId);
  assert(bankAccount);
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );
  const transactions = await transactionRepository.getUserTransactionsExpenses({
    userId: user.id,
    bankAccountId: bankAccountId,
    type: 'weekly',
  });

  await ctx.editMessageReplyMarkup({
    inline_keyboard: buildWeekStatistics(transactions, bankAccount),
  });
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
    if (!isValidCurrency(ctx.message.text)) {
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
      `Done 👍\nThe transaction has been added!`,
      Markup.inlineKeyboard(buildBankAccountMenu(bankAccount.id))
    );
  }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
