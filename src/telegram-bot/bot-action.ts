import { UnreachableCaseError } from 'ts-essentials';

export enum BotAction {
  MainMenu = 'main_menu',
  BankAccountList = 'bank_account_list',
  BankAccountAdd = 'bank_account_add',
  BankAccountRemove = 'bank_account_remove',
  TransactionAddManual = 'transaction_add_manual',
  UploadBankStatement = 'upload_bank_statement',
  SelectBankAccount = 'select_bank_account',
  StatisticMonths = 'stats_months',
  StatisticWeeks = 'stats_weeks',
  SelectStatisticsMonth = 'select_stats_month',
  SelectStatisticsWeek = 'select_stats_month',
}

export enum BotActionHidden {
  FilterTransactionsAll = 'all',
  FilterTransactionsIncome = 'in',
  FilterTransactionsOutcome = 'out',
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
    case BotAction.SelectBankAccount:
      return 'Select bank account';
    case BotAction.StatisticMonths:
      return '📈 Monthly statistics';
    case BotAction.StatisticWeeks:
      return '📈 Weekly statistics';
    case BotAction.SelectStatisticsMonth:
      return 'Select statistics of a month';
    case BotAction.SelectStatisticsWeek:
      return 'Select statistics of a week';
    default:
      throw new UnreachableCaseError(action);
  }
};
