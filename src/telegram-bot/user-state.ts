import { TransactionType } from '../repository/transaction-repository';

type Initial = { type: 'initial' };

type AddingBankAccountName = { type: 'addingBankAccountName' };

type AddingBankAccountCurrency = {
  type: 'addingBankAccountCurrency';
  bankAccountName: string;
};

type AddingTransactionType = {
  type: 'addingTransactionType';
  bankAccountId: string;
};

type AddingTransactionAmount = {
  type: 'addingTransactionAmount';
  bankAccountId: string;
  transactionType: TransactionType;
};

type AddingTransactionTitle = {
  type: 'addingTransactionTitle';
  amount: number;
  bankAccountId: string;
};

export type UserState =
  | Initial
  | AddingBankAccountName
  | AddingBankAccountCurrency
  | AddingTransactionType
  | AddingTransactionAmount
  | AddingTransactionTitle;

export const isInitialState = (state: any): state is Initial => {
  return state?.type === 'initial';
};

export const isAddingBankAccountNameState = (
  state: any
): state is AddingBankAccountName => {
  return state?.type === 'addingBankAccountName';
};

export const isAddingBankAccountCurrencyState = (
  state: any
): state is AddingBankAccountCurrency => {
  return state?.type === 'addingBankAccountCurrency';
};

export const isAddingTransactionAmountState = (
  state: any
): state is AddingTransactionAmount => {
  return state?.type === 'addingTransactionAmount';
};

export const isAddingTransactionTitleState = (
  state: any
): state is AddingTransactionTitle => {
  return state?.type === 'addingTransactionTitle';
};

export const isAddingTransactionType = (
  state: any
): state is AddingTransactionType => {
  return state?.type === 'addingTransactionType';
};
