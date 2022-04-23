import { calcPaginationOffset, createPaginatedResult } from './pagination';

test('calc pagination offset', () => {
  expect(calcPaginationOffset({ page: 1, perPage: 2 })).toStrictEqual({
    perPage: 2,
    offset: 0,
  });
  expect(calcPaginationOffset({ page: 2, perPage: 2 })).toStrictEqual({
    perPage: 2,
    offset: 2,
  });
});

test('create paginated result', () => {
  expect(
    createPaginatedResult({
      items: [1, 2, 3],
      currentPage: 1,
      perPage: 3,
      totalItemsCount: 10,
    })
  ).toStrictEqual({
    currentPage: 1,
    items: [1, 2, 3],
    nextPage: 2,
    previousPage: null,
    totalPages: 4,
    totalItemsCount: 10,
  });

  expect(
    createPaginatedResult({
      items: [4, 5, 6],
      currentPage: 2,
      perPage: 3,
      totalItemsCount: 10,
    })
  ).toStrictEqual({
    currentPage: 2,
    items: [4, 5, 6],
    nextPage: 3,
    previousPage: 1,
    totalPages: 4,
    totalItemsCount: 10,
  });

  expect(
    createPaginatedResult({
      items: [7, 8, 9],
      currentPage: 3,
      perPage: 3,
      totalItemsCount: 10,
    })
  ).toStrictEqual({
    currentPage: 3,
    items: [7, 8, 9],
    nextPage: 4,
    previousPage: 2,
    totalPages: 4,
    totalItemsCount: 10,
  });

  expect(
    createPaginatedResult({
      items: [10],
      currentPage: 4,
      perPage: 3,
      totalItemsCount: 10,
    })
  ).toStrictEqual({
    currentPage: 4,
    items: [10],
    nextPage: null,
    previousPage: 3,
    totalPages: 4,
    totalItemsCount: 10,
  });
});
