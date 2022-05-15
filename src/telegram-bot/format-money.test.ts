import { formatMoney } from './format-money';
import { Currency } from '@prisma/client';

test('format money', () => {
  expect(formatMoney({ amount: 2000, currency: Currency.TRY })).toBe('+20₺');
  expect(formatMoney({ amount: -2000, currency: Currency.TRY })).toBe('-20₺');

  expect(formatMoney({ amount: 100, currency: Currency.USD })).toBe('+1$');
  expect(formatMoney({ amount: -200, currency: Currency.USD })).toBe('-2$');
});
