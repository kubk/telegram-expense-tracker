import { filterTransactionTitleRule } from './filter-transaction-title';
import {
  TransactionImportRule,
  TransactionImportRuleType,
} from '@prisma/client';
import { applyImportRules } from './apply-import-rules';
import { makeTransactionUncountableRule } from './make-transaction-uncountable-rule';

test('apply rules', () => {
  const table = [
    {
      transaction: { title: 'POS TSMZ Migros', isCountable: true },
      expected: { title: 'Migros', isCountable: true },
    },
    {
      transaction: { title: 'POS WATSONS-276-ALANYUM', isCountable: true },
      expected: { title: 'WATSONS-276-ALANYUM', isCountable: true },
    },
    {
      transaction: { title: 'Migros', isCountable: true },
      expected: { title: 'Migros', isCountable: true },
    },
    {
      transaction: { title: '12312343243 Bali manav', isCountable: true },
      expected: { title: 'Bali manav', isCountable: true },
    },
    {
      transaction: { title: 'Bali manav', isCountable: true },
      expected: { title: 'Bali manav', isCountable: true },
    },
    {
      transaction: { title: ' Bali manav', isCountable: true },
      expected: { title: ' Bali manav', isCountable: true },
    },
    {
      transaction: { title: 'ATM Test', isCountable: true },
      expected: { isCountable: false, title: 'ATM Test' },
    },
    {
      transaction: { title: ' ATM Test', isCountable: true },
      expected: { isCountable: true, title: ' ATM Test' },
    },
    {
      transaction: { title: 'Other text ATM Test', isCountable: true },
      expected: { isCountable: true, title: 'Other text ATM Test' },
    },
    {
      transaction: { title: 'Para Çekme', isCountable: true },
      expected: { isCountable: false, title: 'Para Çekme' },
    },
  ] as const;

  const importRules: TransactionImportRule[] = [
    {
      name: '^POS (TSMZ )?',
      bankAccountId: '2fd204fa-c446-4c24-8166-70677f3069e4',
      type: TransactionImportRuleType.FilterTransactionName,
    },
    {
      name: '^\\d{5,}\\s+',
      bankAccountId: '2fd204fa-c446-4c24-8166-70677f3069e4',
      type: TransactionImportRuleType.FilterTransactionName,
    },
    {
      name: '^ATM',
      bankAccountId: '2fd204fa-c446-4c24-8166-70677f3069e4',
      type: TransactionImportRuleType.MakeUncountable,
    },
    {
      name: 'Para [^\\s]+',
      bankAccountId: '2fd204fa-c446-4c24-8166-70677f3069e4',
      type: TransactionImportRuleType.MakeUncountable,
    },
  ];

  table.forEach((row) => {
    expect(
      applyImportRules(row.transaction, importRules, [
        makeTransactionUncountableRule,
        filterTransactionTitleRule,
      ])
    ).toStrictEqual(row.expected);
  });
});
