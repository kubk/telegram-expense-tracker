import { createCurrencyConverter } from './create-currency-converter';
import { Currency } from '@prisma/client';
import { DateTime } from 'luxon';
import axios from 'axios';
import { Cache } from 'cache-manager';
jest.mock('axios');

test('get currency amount in usd', async () => {
  // Let's convert 20 TRY to USD
  // Given TRY to USD is 0.057
  // We should get 1.1 of USD

  // @ts-ignore
  axios.get.mockResolvedValue({ data: { rates: { USD: { rate: 0.057 } } } });

  let usedCacheKey: string | undefined;
  const cacheMock = {
    wrap(key: string, notFoundCallback: () => string) {
      usedCacheKey = key;
      return Promise.resolve(notFoundCallback());
    },
  } as Cache;

  const convertCurrency = createCurrencyConverter(cacheMock);
  const result1 = await convertCurrency(Currency.TRY, 20 * 100, DateTime.fromISO('2022-04-05'));
  expect((result1.amount / 100).toFixed(1)).toBe('1.1');
  expect(usedCacheKey).toBe('TRY:2022-04-05')

  await convertCurrency(Currency.TRY, 20 * 100, DateTime.fromISO('2022-04-06'));
  expect(usedCacheKey).toBe('TRY:2022-04-06')
});
