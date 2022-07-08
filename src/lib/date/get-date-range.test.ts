import { getDateRangeFromMonth } from './get-date-range';

test('get date range from month', () => {
  expect(getDateRangeFromMonth(2022, 1)).toMatchSnapshot();

  expect(() => getDateRangeFromMonth(2022, 99)).toThrow();
});
