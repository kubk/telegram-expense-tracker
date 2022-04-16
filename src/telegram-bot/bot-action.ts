import { UnreachableCaseError } from 'ts-essentials';

export enum BotAction {
  MainMenu = 'main_menu',
  BankAccountList = 'bank_account_list',
  BankAccountAdd = 'bank_account_add',
  BankAccountRemove = 'bank_account_remove',
  TransactionAddManual = 'transaction_add_manual',
  UploadBankStatement = 'upload_bank_statement',
}

export const humanizeAction = (action: BotAction) => {
  switch (action) {
    case BotAction.BankAccountList:
      return '💳 Bank accounts';
    case BotAction.TransactionAddManual:
      return '⌨️ Add manual transaction';
    case BotAction.UploadBankStatement:
      return '🧾 Upload bank statement';
    case BotAction.BankAccountAdd:
      return '➕ Add bank account';
    case BotAction.BankAccountRemove:
      return '❌ Remove bank account';
    case BotAction.MainMenu:
      return 'Main menu';
    default:
      throw new UnreachableCaseError(action);
  }
};
