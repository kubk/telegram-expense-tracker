import { Context } from 'telegraf';
import { transactionRepository } from '../../container';
import { transactionSelectHandler } from './transaction-select-handler';

export const transactionTypeToggleCommand = async (ctx: Context) => {
  const transactionId = (ctx as any).match[1];
  if (!transactionId) {
    return;
  }
  await transactionRepository.toggleTransactionType(transactionId);
  return transactionSelectHandler(ctx);
};
