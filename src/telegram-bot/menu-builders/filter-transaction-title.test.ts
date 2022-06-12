import { filterTransactionTitle } from './filter-transaction-title';
import { FilterTransactionName } from '@prisma/client';

test('filter transaction title', () => {
  const table = [
    { transactionTitle: 'POS TSMZ Migros', expected: 'Migros' },
    { transactionTitle: 'Migros', expected: 'Migros' },
    { transactionTitle: '12312343243 Bali manav', expected: 'Bali manav' },
    { transactionTitle: 'Bali manav', expected: 'Bali manav' },
    { transactionTitle: ' Bali manav', expected: ' Bali manav' },
  ] as const;

  const filters: FilterTransactionName[] = [
    {
      name: '^POS TSMZ ',
      bankAccountId: '2fd204fa-c446-4c24-8166-70677f3069e4',
    },
    {
      name: '^\\d{5,}\\s+',
      bankAccountId: '2fd204fa-c446-4c24-8166-70677f3069e4',
    },
  ];

  table.forEach((row) => {
    expect(filterTransactionTitle(row.transactionTitle, filters)).toBe(
      row.expected
    );
  });
});
