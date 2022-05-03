import { readFileSync, existsSync } from 'fs';
import { parseTransactions } from '../src/yapi-kredi-parser/parse-transactions';
import { transactionRepository } from '../src/container';

// export $(cat .env.prod | xargs) && npx ts-node bin/import-transactions-from-file.ts ~/Downloads/march2.pdf
// export $(cat .env.prod | xargs) && npx ts-node bin/import-transactions-from-file.ts ~/Downloads/may.pdf
// export $(cat .env.prod | xargs) && npx ts-node bin/import-transactions-from-file.ts ~/Downloads/april.pdf
// export $(cat .env.prod | xargs) && npx ts-node bin/import-transactions-from-file.ts ~/Downloads/usd-transactions.pdf

(async () => {
  const path = process.argv[2];

  if (!path || !existsSync(path)) {
    throw new Error('\nError: Please specify file path as a second argument');
  }

  const dataBuffer = readFileSync(path);
  const parsedTransactions = await parseTransactions(dataBuffer);
  // TRY
  // const bankAccountId = '0ce01a51-cc6d-4d6a-a882-229413b0a411';
  // TRY
  const bankAccountId = '150b326b-2890-4e8a-88c5-0f8d64d00181';

  const result = await transactionRepository.importTransactions(
    bankAccountId,
    parsedTransactions.map((item) => ({
      ...item,
      bankAccountId: bankAccountId,
    }))
  );
  console.log({ result });
})();
