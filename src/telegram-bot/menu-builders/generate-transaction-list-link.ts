import {
  StatisticGroupByType,
  TransactionSortDirection,
  TransactionSortField,
  UserTransactionListFilter,
} from '../../repository/transaction-repository';

export const generateTransactionListLink = (options: {
  type: StatisticGroupByType;
  bankAccountId: string;
  groupYear: number;
  groupNumber: number;
  filter: UserTransactionListFilter;
  sortDirection: TransactionSortDirection;
  sortField: TransactionSortField;
  page: number;
}) => {
  return [
    options.type,
    options.bankAccountId,
    options.groupYear,
    options.groupNumber,
    options.filter,
    options.sortField,
    options.sortDirection,
    options.page,
  ].join(':');
};