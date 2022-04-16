import { existsSync, readFileSync } from 'fs';
import { parseTransactions } from './parse-transactions';

const table = [
  {
    pdfPath: '/Users/egor/Downloads/at1.pdf',
    testName: 'it parses one page PDF',
  },
  {
    pdfPath: '/Users/egor/Downloads/march.pdf',
    testName: 'it parses multi page page PDF',
  },
];

table.forEach((testCase) => {
  // Jest doesn't allow skipping tests programmatically, that's why we do it here with the loop
  const testOrSkip = existsSync(testCase.pdfPath) ? test : test.skip;

  testOrSkip(testCase.testName, async () => {
    const path = testCase.pdfPath;
    const dataBuffer = readFileSync(path);

    expect(await parseTransactions(dataBuffer)).toMatchSnapshot();
  });
});
