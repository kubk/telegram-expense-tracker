import { Transaction } from '@prisma/client';
import { Markup } from 'telegraf';
import { BotButtons, humanizeButton } from '../bot-action';

export const buildTransactionPageMenu = (transaction: Transaction) => {
  return [
    [
      Markup.button.callback(
        'Is countable - Yes 💶',
        BotButtons.BankAccountListButton
      ),
    ],
    [
      Markup.button.callback(
        'Remove transaction 🗑',
        BotButtons.BankAccountListButton
      ),
    ],
    [
      Markup.button.callback(
        humanizeButton(BotButtons.BankAccountListButtonWithRemove),
        BotButtons.BankAccountListButtonWithRemove
      ),
    ],
  ];
};
