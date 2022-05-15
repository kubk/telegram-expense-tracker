import { Transaction } from '@prisma/client';
import { Markup } from 'telegraf';
import { BotButtons, BotCallbackQuery, humanizeButton } from '../bot-action';

const getOppositeTransactionType = (transaction: Transaction) => {
  if (transaction.amount > 0) {
    return 'Expense';
  }
  if (transaction.amount < 0) {
    return 'Top up';
  }
  throw new Error('Unable to get opposite transaction for 0 amount');
};

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
        `Change transaction type to ${getOppositeTransactionType(transaction)}`,
        `${BotCallbackQuery.TransactionTypeToggle}:${transaction.id}`
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
