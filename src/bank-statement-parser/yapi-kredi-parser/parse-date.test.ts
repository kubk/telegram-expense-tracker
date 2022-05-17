import { DateTime } from 'luxon';
import { parseDate } from './parse-date';

test('parse date', () => {
  const result = DateTime.fromJSDate(parseDate('01/04/2022', '13:47:03'));

  expect(result.month).toBe(4);
  expect(result.day).toBe(1);
  expect(result.year).toBe(2022);
  expect(result.hour).toBe(13);
  expect(result.minute).toBe(47);
  expect(result.second).toBe(3);
});
