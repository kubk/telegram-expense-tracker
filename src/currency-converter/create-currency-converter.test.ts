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

  const cacheMock = {
    wrap(key: string, notFoundCallback: () => string) {
      return Promise.resolve(notFoundCallback());
    },
  } as Cache;

  const convertCurrency = createCurrencyConverter(cacheMock);
  const timeMock = DateTime.fromISO('2022-04-05');

  const result = await convertCurrency(Currency.TRY, 20 * 100, timeMock);

  expect((result.amount / 100).toFixed(1)).toBe('1.1');
});
