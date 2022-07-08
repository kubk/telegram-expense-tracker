import {
  TransactionSortDirection,
  TransactionSortField,
  UserTransactionListFilter,
} from '../../repository/transaction-repository';

export const generateTransactionListLink = (options: {
  bankAccountShortId: number;
  groupYear: number;
  groupNumber: number;
  filter: UserTransactionListFilter;
  sortDirection: TransactionSortDirection;
  sortField: TransactionSortField;
  page: number;
}) => {
  return [
    options.bankAccountShortId,
    options.groupYear,
    options.groupNumber,
    options.filter,
    options.sortField,
    options.sortDirection,
    options.page,
  ].join(':');
};
