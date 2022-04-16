import { config } from '../container';

export type Pagination = {
  page: number;
  perPage?: number;
};

export const calcPaginationOffset = (pagination: Pagination) => {
  const { page, perPage = config.pagination.perPage } = pagination;

  return { offset: (page - 1) * perPage, perPage };
};
