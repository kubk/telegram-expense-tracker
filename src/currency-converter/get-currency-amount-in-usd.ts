import { Currency } from '@prisma/client';
import { DateTime } from 'luxon';
import { assert } from 'ts-essentials';
import axios from 'axios';
import { getEnvSafe } from '../lib/env/env';
import { cache } from '../container';

export const getCurrencyAmountInUsd = async (
  from: Currency,
  amountSafe: number,
  date: DateTime
) => {
  const rate = await cache.wrap(`${from}:${date.toFormat('yyyy-MM')}`, () =>
    getCurrencyToUsdHistoricalRate(from, amountSafe, date)
  );

  return {
    currency: Currency.USD,
    amount: amountSafe * parseFloat(rate),
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
    .then((response) => response.data);

  return result['rates']['USD']['rate'];
};
