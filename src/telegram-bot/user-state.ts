type Initial = { type: 'initial' };

type AddingBankAccountName = { type: 'addingBankAccountName' };

type AddingBankAccountCurrency = {
  type: 'addingBankAccountCurrency';
  bankAccountName: string;
};

type AddingTransactionAmount = {
  type: 'addingTransactionAmount';
  bankAccountId: string;
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
