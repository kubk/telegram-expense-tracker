import { readFileSync, existsSync } from 'fs';
import { parseTransactions } from '../src/bank-statement-parser/yapi-kredi-parser/parse-transactions';
import { transactionRepository } from '../src/container';

/**
 * Usage
 *
 * export $(cat .env.prod | xargs) && npx ts-node bin/import-transactions-from-file.ts ~/Downloads/path-to.pdf UUID
 */
(async () => {
  const path = process.argv[2];
  const bankAccountId = process.argv[3];

  if (!path || !existsSync(path)) {
    throw new Error('Error: Please specify file path as a second argument');
  }
  if (!bankAccountId) {
    throw new Error('Error: Please specify bank account as a third argument');
  }

  const dataBuffer = readFileSync(path);
  const parsedTransactions = await parseTransactions(dataBuffer);

  const result = await transactionRepository.importTransactions(
    bankAccountId,
    parsedTransactions
  );
  console.log({ result });
})();
