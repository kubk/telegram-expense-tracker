import { parseMoney } from './parse-money';

test('parse currency', () => {
  const table = [
    ['4.150,34 TL', { amount: 415034, currency: 'TRY' }],
    ['10.234,00 TL', { amount: 1023400, currency: 'TRY' }],
    ['148,00 USD', { amount: 14800, currency: 'USD' }],
    ['-6,51 TL', { amount: -651, currency: 'TRY' }],
    ['0.51 TL', { amount: 51, currency: 'TRY' }],
    ['39.00 TL', { amount: 3900, currency: 'TRY' }],
  ] as const;

  table.forEach(([original, parsed]) => {
    expect(parseMoney(original)).toStrictEqual(parsed);
  });
});
