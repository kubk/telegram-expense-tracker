import { Markup } from 'telegraf';
import { BotButtons, humanizeButton } from '../bot-action';

export const buildBankAccountMenu = (bankAccountShortId: number) => {
  return [
    [
      Markup.button.callback(
        humanizeButton(BotButtons.StatisticMonthsButton),
        `${BotButtons.StatisticMonthsButton}:${bankAccountShortId}`
      ),
    ],
    [
      Markup.button.callback(
        humanizeButton(BotButtons.StatisticWeeksButton),
        `${BotButtons.StatisticWeeksButton}:${bankAccountShortId}`
      ),
    ],
    [
      Markup.button.callback(
        humanizeButton(BotButtons.UploadBankStatementButton),
        `${BotButtons.UploadBankStatementButton}:${bankAccountShortId}`
      ),
    ],
    [
      Markup.button.callback(
        humanizeButton(BotButtons.TransactionAddManualButton),
        `${BotButtons.TransactionAddManualButton}:${bankAccountShortId}`
      ),
    ],
    [Markup.button.callback('◀️ Back', BotButtons.BankAccountListButton)],
  ];
};
