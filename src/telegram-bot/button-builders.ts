import { BankAccount, Currency } from '@prisma/client';
import { Markup } from 'telegraf';
import { BotAction, BotActionHidden, humanizeAction } from './bot-action';
import { UserTransactionExpenseRowItem } from '../repository/transaction-repository';
import { formatMoney } from './format-money';
import { currencyToSymbol } from './currency-to-symbol';

export const buildBankAccountMenu = (bankAccountId: string) => {
  return [
    [
      Markup.button.callback(
        humanizeAction(BotAction.StatisticMonths),
        `${BotAction.StatisticMonths}:${bankAccountId}`
      ),
    ],
    [
      Markup.button.callback(
        humanizeAction(BotAction.StatisticWeeks),
        `${BotAction.StatisticWeeks}:${bankAccountId}`
      ),
    ],
    [
      Markup.button.callback(
        humanizeAction(BotAction.UploadBankStatement),
        BotAction.UploadBankStatement
      ),
    ],
    [
      Markup.button.callback(
        humanizeAction(BotAction.TransactionAddManual),
        `${BotAction.TransactionAddManual}:${bankAccountId}`
      ),
    ],
    [Markup.button.callback('◀️ Back', BotAction.BankAccountList)],
  ];
};

const buildStatisticGrid = (
  row: UserTransactionExpenseRowItem,
  bankAccount: { id: string; currency: Currency }
) => {
  return [
    Markup.button.callback(
      `${row.groupname} ${formatMoney(
        row.difference,
        bankAccount.currency
      ).padStart(10, ' ')}`,
      `${BotAction.SelectStatisticsMonth}:${row.groupname}:${BotActionHidden.FilterTransactionsAll}`
    ),
    Markup.button.callback(
      `${formatMoney(row.income, bankAccount.currency)}`,
      `${BotAction.SelectStatisticsMonth}:${row.groupname}:${BotActionHidden.FilterTransactionsIncome}`
    ),
    Markup.button.callback(
      formatMoney(row.outcome, bankAccount.currency),
      `${BotAction.SelectStatisticsMonth}:${row.groupname}:${BotActionHidden.FilterTransactionsOutcome}`
    ),
  ];
};

export const buildMonthStatistics = (
  statisticRows: UserTransactionExpenseRowItem[],
  bankAccount: { id: string; currency: Currency }
) => {
  return [
    ...statisticRows.map((row) => buildStatisticGrid(row, bankAccount)),
    [
      Markup.button.callback(
        '◀️ Back',
        `${BotAction.SelectBankAccount}:${bankAccount.id}`
      ),
    ],
  ];
};

export const buildWeekStatistics = (
  statisticRows: UserTransactionExpenseRowItem[],
  bankAccount: BankAccount
) => {
  return [
    ...statisticRows.map((row) => buildStatisticGrid(row, bankAccount)),
    [
      Markup.button.callback(
        '◀️ Back',
        `${BotAction.SelectBankAccount}:${bankAccount.id}`
      ),
    ],
  ];
};

export const buildBankAccountListMenu = (bankAccounts: BankAccount[]) => {
  return [
    [
      Markup.button.callback(
        humanizeAction(BotAction.BankAccountAdd),
        BotAction.BankAccountAdd
      ),
    ],
    ...bankAccounts.map((bankAccount) => [
      Markup.button.callback(
        `${bankAccount.name} (${currencyToSymbol(bankAccount.currency)})`,
        `${BotAction.SelectBankAccount}:${bankAccount.id}`
      ),
    ]),
  ];
};
