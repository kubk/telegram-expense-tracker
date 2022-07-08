import { Transaction } from '@prisma/client';
import { Markup } from 'telegraf';
import { BotButtons, BotCallbackQuery } from '../bot-action';

export const buildTransactionDeleteMenu = (transaction: Transaction) => {
  return [
    [
      Markup.button.callback(
        `Delete transaction`,
        `${BotCallbackQuery.TransactionDeleteDo}:${transaction.id}`
      ),
      Markup.button.callback(
        `Cancel`,
        `${BotButtons.BankAccountListButtonWithRemove}`
      ),
    ],
  ];
};
