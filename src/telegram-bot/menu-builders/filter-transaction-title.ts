import { FilterTransactionName } from '@prisma/client';

export const filterTransactionTitle = (
  title: string,
  filters: FilterTransactionName[]
) => {
  return filters.reduce(
    (accumulator, current) => accumulator.replace(new RegExp(current.name), ''),
    title
  );
};
