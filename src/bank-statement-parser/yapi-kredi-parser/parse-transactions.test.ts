import { existsSync, readFileSync } from 'fs';
import { parseTransactions } from './parse-transactions';
import { transactionRepository } from '../../container';
import { fixtures, useRefreshDb } from '../../fixtures/use-refresh-db';
import { testIf } from '../../lib/jest/test-if';

useRefreshDb();

testIf(
  () => existsSync('/Users/egor/Downloads/2022-april.pdf'),
  'import transactions removes old and adds new',
  async () => {
    const path = '/Users/egor/Downloads/2022-april.pdf';
    const dataBuffer = readFileSync(path);
    const result = await parseTransactions(dataBuffer);
    const bankAccountId = fixtures.bankAccounts.user_1_ba_usd.uuid;

    const importTransactions = () => {
      return transactionRepository.importTransactions(bankAccountId, result);
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
