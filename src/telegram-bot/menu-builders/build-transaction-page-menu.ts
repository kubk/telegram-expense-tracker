import { Transaction } from '@prisma/client';
import { Markup } from 'telegraf';
import { BotCallbackQuery } from '../bot-action';

const getOppositeTransactionType = (transaction: Transaction) => {
  if (transaction.amount > 0) {
    return 'Expense';
  }
  if (transaction.amount < 0) {
    return 'Top up';
  }
  throw new Error('Unable to get opposite transaction for 0 amount');
};

export const buildTransactionPageMenu = (options: {
  transaction: Transaction;
  currentPageLink: string;
  action: string;
  backLink: string;
}) => {
  const { transaction, currentPageLink, action, backLink } = options;

  const changeIsCountableLink = `${
    action ? currentPageLink.replace(`:${action}`, '') : currentPageLink
  }:${BotCallbackQuery.TransactionIsCountableToggle}`;

  const changeTypeLink = `${
    action ? currentPageLink.replace(`:${action}`, '') : currentPageLink
  }:${BotCallbackQuery.TransactionTypeToggle}`;

  return [
    [
      Markup.button.callback(
        `Is countable - ${transaction.isCountable ? 'Yes 💶' : 'No 👻'}`,
        changeIsCountableLink
      ),
    ],
    [
      Markup.button.callback(
        `Change transaction type to ${getOppositeTransactionType(transaction)}`,
        changeTypeLink
      ),
    ],
    [
      Markup.button.callback(
        'Remove transaction 🗑',
        `${BotCallbackQuery.TransactionDeleteAsk}:${transaction.id}`
      ),
    ],
    [Markup.button.callback('Back', backLink)],
  ];
};
