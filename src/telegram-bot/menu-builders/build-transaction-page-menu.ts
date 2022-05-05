import { Transaction } from '@prisma/client';
import { Markup } from 'telegraf';
import { BotButtons, BotCallbackQuery, humanizeButton } from '../bot-action';

export const buildTransactionPageMenu = (transaction: Transaction) => {
  return [
    [
      Markup.button.callback(
        `Is countable - ${transaction.isCountable ? 'Yes 💶' : 'No 👻'}`,
        `${BotCallbackQuery.TransactionIsCountableToggle}:${transaction.id}`
      ),
    ],
    [
      Markup.button.callback(
        'Remove transaction 🗑',
        `${BotCallbackQuery.TransactionDeleteAsk}:${transaction.id}`
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
