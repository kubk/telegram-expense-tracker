import { buildMonthStatistics } from './button-builders';
import { Currency } from '@prisma/client';

test('buildMonthStatistics', () => {
  expect(
    buildMonthStatistics(
      [
        {
          income: 1 * 100,
          currency: Currency.TRY,
          outcome: -10 * 100,
          groupname: '2',
          difference: -9 * 100,
        },
        {
          income: 1000 * 100,
          currency: Currency.TRY,
          outcome: -999 * 100,
          groupname: '1',
          difference: 1 * 100,
        },
      ],
      {
        id: '1',
        currency: 'TRY',
      }
    )
  ).toMatchSnapshot();
});
