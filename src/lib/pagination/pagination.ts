import { config } from '../../container';
import { assert } from 'ts-essentials';

export type PaginatedResult<T> = {
  items: T[];
  totalItemsCount: number;
  currentPage: number;
  totalPages: number;
  nextPage: number | null;
  previousPage: number | null;
};

export const createPaginatedResult = <T>(options: {
  items: T[];
  totalItemsCount: number;
  perPage: number;
  currentPage: number;
}): PaginatedResult<T> => {
  const totalPages = Math.ceil(options.totalItemsCount / options.perPage);
  assert(options.currentPage <= totalPages);
  assert(options.currentPage > 0);

  return {
    items: options.items,
    totalItemsCount: options.totalItemsCount,
    currentPage: options.currentPage,
    totalPages,
    nextPage: options.currentPage < totalPages ? options.currentPage + 1 : null,
    previousPage: options.currentPage === 1 ? null : options.currentPage - 1,
  };
};

export type CalcPaginationParams = {
  page: number;
  perPage: number;
};

export const calcPaginationOffset = (pagination: CalcPaginationParams) => {
  const { page, perPage } = pagination;

  return { offset: (page - 1) * perPage, perPage };
};
