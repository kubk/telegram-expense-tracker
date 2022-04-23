import { UnreachableCaseError } from 'ts-essentials';

export enum BotButtons {
  BankAccountListButton = 'bank_account_list',
  BankAccountAddButton = 'bank_account_add',
  BankAccountRemoveButton = 'bank_account_remove',
  TransactionAddManualButton = 'transaction_add_manual',
  UploadBankStatementButton = 'upload_bank_statement',
  StatisticMonthsButton = 'stats_months',
  StatisticWeeksButton = 'stats_weeks',
}

export enum BotCallbackQuery {
  SelectBankAccount = 'select_bank_account',
  TransactionSelect = 'select_transaction',
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
    case BotButtons.StatisticWeeksButton:
      return '📈 Weekly statistics';
    default:
      throw new UnreachableCaseError(action);
  }
};
