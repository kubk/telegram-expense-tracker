type Initial = { type: 'initial' };
type AddingBankAccountName = { type: 'addingBankAccountName' };
type AddingBankAccountCurrency = {
  type: 'addingBankAccountCurrency';
  bankAccountName: string;
};

export type UserState =
  | Initial
  | AddingBankAccountName
  | AddingBankAccountCurrency;

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
