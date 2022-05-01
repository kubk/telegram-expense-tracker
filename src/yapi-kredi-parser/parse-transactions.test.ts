import { existsSync, readFileSync } from 'fs';
import { parseTransactions } from './parse-transactions';
import { transactionRepository } from '../container';
import { fixtures, useRefreshDb } from '../fixtures/use-refresh-db';
import { testIf } from '../lib/jest/test-if';

useRefreshDb();

testIf(
  () => existsSync('/Users/egor/Downloads/2022-april.pdf'),
  'import transactions removes old and adds new',
  async () => {
    const path = '/Users/egor/Downloads/2022-april.pdf';
    const dataBuffer = readFileSync(path);
    const result = await parseTransactions(dataBuffer);
    const bankAccountId = fixtures.bankAccounts.user_1_ba_usd;

    const importTransactions = () => {
      return transactionRepository.importTransactions(
        bankAccountId,
        result.map((item) => ({
          ...item,
          bankAccountId: bankAccountId,
        }))
      );
    };

    const firstResult = await importTransactions();

    expect(firstResult).toStrictEqual({ added: result.length, removed: 0 });

    const secondResult = await importTransactions();

    expect(secondResult).toStrictEqual({
      added: result.length,
      removed: result.length,
    });
  }
);

testIf(
  () => existsSync('/Users/egor/Downloads/at1.pdf'),
  'it parses one page PDF',
  async () => {
    const dataBuffer = readFileSync('/Users/egor/Downloads/at1.pdf');
    expect(await parseTransactions(dataBuffer)).toMatchSnapshot();
  }
);

testIf(
  () => existsSync('/Users/egor/Downloads/usd-transactions.pdf'),
  'PDF with USD',
  async () => {
    const dataBuffer = readFileSync(
      '/Users/egor/Downloads/usd-transactions.pdf'
    );
    expect(await parseTransactions(dataBuffer)).toMatchSnapshot();
  }
);

testIf(
  () => existsSync('/Users/egor/Downloads/march.pdf'),
  'it parses multi page page PDF',
  async () => {
    const dataBuffer = readFileSync('/Users/egor/Downloads/march.pdf');
    expect(await parseTransactions(dataBuffer)).toMatchSnapshot();
  }
);
