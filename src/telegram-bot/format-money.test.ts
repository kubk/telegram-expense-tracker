import { formatMoney } from './format-money';
import { Currency } from '@prisma/client';

test('format money', () => {
  expect(formatMoney(2000, Currency.TRY)).toBe('+20₺');
  expect(formatMoney(-2000, Currency.TRY)).toBe('-20₺');

  expect(formatMoney(100, Currency.USD)).toBe('+1$');
  expect(formatMoney(-200, Currency.USD)).toBe('-2$');
});
