import { Currency } from '@prisma/client';
import { DateTime } from 'luxon';
import { assert } from 'ts-essentials';
import axios from 'axios';
import { getEnvSafe } from '../lib/env/env';
import { Cache } from 'cache-manager';

export const createCurrencyConverter = (cache: Cache) => {
  return async (from: Currency, amountSafe: number, date: DateTime) => {
    const rate = await cache.wrap(`${from}:${date.toFormat('yyyy-MM-dd')}`, () => {
      return getCurrencyToUsdHistoricalRate(from, amountSafe, date);
    });

    return {
      currency: Currency.USD,
      amount: amountSafe * parseFloat(rate),
    };
  };
};

const getCurrencyToUsdHistoricalRate = async (
  from: Currency,
  amountSafe: number,
  date: DateTime
) => {
  assert(from !== Currency.USD);

  const result = await axios
    .get<{ rates: { USD: { rate: string } } }>(
      `https://api.getgeoapi.com/v2/currency/historical/${date.toFormat(
        'yyyy-MM-dd'
      )}`,
      {
        params: {
          api_key: getEnvSafe('CURRENCY_API_TOKEN'),
          from: from,
          to: 'USD',
          amount: (amountSafe / 100).toFixed(2),
          format: 'json',
        },
      }
    )
    .then((response) => {
      return response.data;
    });

  return result['rates']['USD']['rate'];
};
