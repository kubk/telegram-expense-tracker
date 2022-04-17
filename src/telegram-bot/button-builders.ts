import { BankAccount, Currency } from '@prisma/client';
import { Markup } from 'telegraf';
import { BotAction, humanizeAction } from './bot-action';
import { currencyToSymbol, formatMoney } from './currency-to-symbol';
import { UserTransactionExpenseRowItem } from '../repository/transaction-repository';

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

const buildTransactionExpenseRowText = (
  row: UserTransactionExpenseRowItem,
  bankAccount: BankAccount
) => {
  return `${row.groupname} |  +${formatMoney(
    row.income,
    bankAccount.currency
  )}  ${formatMoney(row.outcome, bankAccount.currency)} = ${formatMoney(
    row.outcome,
    bankAccount.currency
  )}`;
};

export const buildMonthStatistics = (
  statisticRows: UserTransactionExpenseRowItem[],
  bankAccount: BankAccount
) => {
  return [
    ...statisticRows.map((row) => {
      return [
        Markup.button.callback(
          buildTransactionExpenseRowText(row, bankAccount),
          `${BotAction.SelectStatisticsMonth}:${row.groupname}`
        ),
      ];
    }),
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
    ...statisticRows.map((row) => {
      return [
        Markup.button.callback(
          buildTransactionExpenseRowText(row, bankAccount),
          `${BotAction.SelectStatisticsWeek}:${row.groupname}`
        ),
      ];
    }),
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
