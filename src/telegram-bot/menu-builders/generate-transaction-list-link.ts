import {
  FilterTransactionIsCountable,
  FilterTransactionSource,
  TransactionSortDirection,
  TransactionSortField,
  UserTransactionListFilter,
} from '../../repository/transaction-repository';

export enum FilterTransactionState {
  Changing = 'fc',
  Applied = 'fa',
}

export type TransactionFilters = {
  filterState: FilterTransactionState;
  transactionType: UserTransactionListFilter;
  filterSource: FilterTransactionSource;
  filterCountable: FilterTransactionIsCountable;
};

export type GenerateTransactionListLinkParams = {
  bankAccountShortId: number;
  groupYear: number;
  groupNumber: number;
  filters: TransactionFilters;
  sortDirection: TransactionSortDirection;
  sortField: TransactionSortField;
  page: number;
};

export const generateTransactionListLink = (
  options: GenerateTransactionListLinkParams
) => {
  return [
    options.bankAccountShortId,
    options.groupYear,
    options.groupNumber,
    options.filters.transactionType,
    options.sortField,
    options.sortDirection,
    options.filters.filterState,
    options.filters.filterSource,
    options.filters.filterCountable,
    options.page,
  ].join(':');
};
