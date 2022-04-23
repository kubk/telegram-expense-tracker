import { BankAccount } from '@prisma/client';
import { Markup } from 'telegraf';
import { BotButtons, BotCallbackQuery, humanizeButton } from './bot-action';
import { currencyToSymbol } from './currency-to-symbol';

export const buildBankAccountListMenu = (bankAccounts: BankAccount[]) => {
  return [
    [
      Markup.button.callback(
        humanizeButton(BotButtons.BankAccountAddButton),
        BotButtons.BankAccountAddButton
      ),
    ],
    ...bankAccounts.map((bankAccount) => [
      Markup.button.callback(
        `${bankAccount.name} (${currencyToSymbol(bankAccount.currency)})`,
        `${BotCallbackQuery.SelectBankAccount}:${bankAccount.id}`
      ),
    ]),
  ];
};
