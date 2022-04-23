import { getDateRangeFromMonth, getDateRangeFromWeek } from './get-date-range';

test('get date range from week', () => {
  expect(getDateRangeFromWeek(2022, 1)).toMatchSnapshot();
  expect(getDateRangeFromWeek(2022, 2)).toMatchSnapshot();
  expect(getDateRangeFromWeek(2022, 3)).toMatchSnapshot();

  expect(() => getDateRangeFromWeek(2022, 99)).toThrow();
});

test('get date range from month', () => {
  expect(getDateRangeFromMonth(2022, 1)).toMatchSnapshot();

  expect(() => getDateRangeFromMonth(2022, 99)).toThrow();
});
