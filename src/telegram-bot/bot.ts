import { Markup, Telegraf } from 'telegraf';
import { getEnvSafe } from '../utils/get-env-safe';
import { bankRepository, userRepository } from '../container';
import { assert } from 'ts-essentials';
import { currencyToSymbol, isValidCurrency } from './currency-to-symbol';
import { BotAction, humanizeAction } from './bot-action';
import {
  isAddingBankAccountCurrencyState,
  isAddingBankAccountNameState,
  isInitialState,
} from './user-state';

const bot = new Telegraf(getEnvSafe('TELEGRAM_BOT_TOKEN'));

bot.use(Telegraf.log());

const buildMainMenu = () => {
  return [
    [
      Markup.button.callback(
        humanizeAction(BotAction.BankAccountList),
        BotAction.BankAccountList
      ),
    ],
    [
      Markup.button.callback(
        humanizeAction(BotAction.TransactionAddManual),
        BotAction.TransactionAddManual
      ),
    ],
    [
      Markup.button.callback(
        humanizeAction(BotAction.UploadBankStatement),
        BotAction.UploadBankStatement
      ),
    ],
  ] as any;
};

bot.command('start', async (ctx) => {
  await userRepository.createUserIfNotExists(ctx.message.from.id);
  await ctx.reply(
    `Hello 👋\nThis is a Telegram bot to track your expenses`,
    Markup.inlineKeyboard(buildMainMenu())
  );
});

bot.action(BotAction.MainMenu, async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageReplyMarkup({ inline_keyboard: buildMainMenu() });
});

bot.action(BotAction.BankAccountList, async (ctx) => {
  await ctx.answerCbQuery();
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );
  const bankAccounts = await bankRepository.getUserBankAccounts(user.id);

  await ctx.editMessageReplyMarkup({
    inline_keyboard: [
      [
        Markup.button.callback(
          humanizeAction(BotAction.BankAccountAdd),
          BotAction.BankAccountAdd
        ),
      ],
      ...bankAccounts.map((bankAccount) => [
        Markup.button.callback(
          `${bankAccount.name} (${currencyToSymbol(bankAccount.currency)})`,
          'bank_account:' + bankAccount.id
        ),
      ]),
      [Markup.button.callback('◀️ Back', BotAction.MainMenu)],
    ],
  });
});

bot.action(BotAction.BankAccountAdd, async (ctx) => {
  await ctx.answerCbQuery();
  const user = await userRepository.getUserByTelegramIdOrThrow(
    ctx.callbackQuery.from.id
  );
  assert(user.telegramProfile);
  await ctx.reply('Please send me the account name');
  await userRepository.setUserState(user.telegramProfile.id, {
    type: 'addingBankAccountName',
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
    await ctx.reply('Please send me the account currency');
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
    await ctx.reply(
      `The bank account has been added 👍`,
      Markup.inlineKeyboard(buildMainMenu())
    );
  }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
