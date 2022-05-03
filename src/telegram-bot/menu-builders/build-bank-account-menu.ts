import { Markup } from 'telegraf';
import { BotButtons, humanizeButton } from '../bot-action';

export const buildBankAccountMenu = (bankAccountId: string) => {
  return [
    [
      Markup.button.callback(
        humanizeButton(BotButtons.StatisticMonthsButton),
        `${BotButtons.StatisticMonthsButton}:${bankAccountId}`
      ),
    ],
    [
      Markup.button.callback(
        humanizeButton(BotButtons.StatisticWeeksButton),
        `${BotButtons.StatisticWeeksButton}:${bankAccountId}`
      ),
    ],
    [
      Markup.button.callback(
        humanizeButton(BotButtons.UploadBankStatementButton),
        BotButtons.UploadBankStatementButton
      ),
    ],
    [
      Markup.button.callback(
        humanizeButton(BotButtons.TransactionAddManualButton),
        `${BotButtons.TransactionAddManualButton}:${bankAccountId}`
      ),
    ],
    [Markup.button.callback('◀️ Back', BotButtons.BankAccountListButton)],
  ];
};
