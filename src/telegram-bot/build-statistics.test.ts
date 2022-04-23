import { buildMonthStatistics } from './build-statistics';
import { Currency } from '@prisma/client';

test('build statistics', () => {
  expect(
    buildMonthStatistics(
      [
        {
          income: 1 * 100,
          currency: Currency.TRY,
          outcome: -10 * 100,
          groupname: 'Apr',
          groupyear: 2022,
          groupnumber: 2,
          difference: -9 * 100,
        },
        {
          income: 1000 * 100,
          currency: Currency.TRY,
          outcome: -999 * 100,
          groupyear: 2022,
          groupname: 'Mar',
          groupnumber: 1,
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
