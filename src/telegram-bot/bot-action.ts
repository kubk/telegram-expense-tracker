import { UnreachableCaseError } from 'ts-essentials';

export enum BotButtons {
  BankAccountListButton = 'bank_account_list',
  BankAccountListButtonWithRemove = 'bank_account_list:remove',
  BankAccountAddButton = 'bank_account_add',
  BankAccountRemoveButton = 'bank_account_remove',
  TransactionAddManualButton = 'transaction_add_manual',
  UploadBankStatementButton = 'upload_bank_statement',
  StatisticMonthsButton = 'stats_months',
}

export enum BotCallbackQuery {
  SelectBankAccount = 'select_bank_account',
  TransactionSelect = 's',
  TransactionTypeToggle = 'ttt',
  TransactionIsCountableToggle = 'tic',
  TransactionDeleteAsk = 'transaction_del_ask',
  TransactionDeleteDo = 'transaction_del_do',
  TransactionAddManualAmount = 'transaction_manual',
}

export const humanizeButton = (action: BotButtons) => {
  switch (action) {
    case BotButtons.BankAccountListButton:
      return '💳 Bank accounts';
    case BotButtons.TransactionAddManualButton:
      return '⌨️ Add manual transaction';
    case BotButtons.UploadBankStatementButton:
      return '🧾 Upload bank statement';
    case BotButtons.BankAccountAddButton:
      return '➕ Add bank account';
    case BotButtons.BankAccountRemoveButton:
      return '❌ Remove bank account';
    case BotButtons.StatisticMonthsButton:
      return '📈 Monthly statistics';
    case BotButtons.BankAccountListButtonWithRemove:
      return '◀️ Back to bank accounts';
    default:
      throw new UnreachableCaseError(action);
  }
};
