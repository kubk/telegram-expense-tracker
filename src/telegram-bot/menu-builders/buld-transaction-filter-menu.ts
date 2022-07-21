import { Markup } from 'telegraf';
import {
  FilterTransactionIsCountable,
  FilterTransactionSource,
} from '../../repository/transaction-repository';
import {
  FilterTransactionState,
  generateTransactionListLink,
  GenerateTransactionListLinkParams,
  TransactionFilters,
} from './generate-transaction-list-link';

export const buildTransactionFilterMenu = (
  filters: TransactionFilters,
  linkParamsWithoutFilters: Omit<GenerateTransactionListLinkParams, 'filters'>
) => {
  const transactionSourceFilterButtons = [
    { text: 'Manual', filter: FilterTransactionSource.Manual },
    { text: 'Imported', filter: FilterTransactionSource.Imported },
    { text: 'All', filter: FilterTransactionSource.All },
  ];

  const transactionIsCountableFilterButtons = [
    { text: 'Countable', filter: FilterTransactionIsCountable.Countable },
    { text: 'Uncountable', filter: FilterTransactionIsCountable.Uncountable },
    { text: 'All', filter: FilterTransactionIsCountable.All },
  ];

  return [
    transactionSourceFilterButtons.map((button) => {
      return Markup.button.callback(
        `${button.text} ${filters.filterSource === button.filter ? '✅' : ''}`,
        generateTransactionListLink({
          ...linkParamsWithoutFilters,
          filters: {
            ...filters,
            filterSource: button.filter,
          },
        })
      );
    }),
    transactionIsCountableFilterButtons.map((button) => {
      return Markup.button.callback(
        `${button.text} ${
          filters.filterCountable === button.filter ? '✅' : ''
        }`,
        generateTransactionListLink({
          ...linkParamsWithoutFilters,
          filters: {
            ...filters,
            filterCountable: button.filter,
          },
        })
      );
    }),
    [
      Markup.button.callback(
        `Apply`,
        generateTransactionListLink({
          ...linkParamsWithoutFilters,
          filters: {
            ...filters,
            filterState: FilterTransactionState.Applied,
          },
        })
      ),
    ],
  ];
};
