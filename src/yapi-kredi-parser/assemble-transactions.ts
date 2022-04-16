import { Transaction } from './types';
import { ITEM_SEPARATOR } from './constants';
import { parseMoney } from './parse-money';
import { parseDate } from './parse.date';

type TemporaryTransaction = {
  createdAt: Date;
  info: string;
  titlePieces: string[];
};

const createTransactionInfo = (left: string, right: string) => {
  return `${left} / ${right}`;
};

export const assembleTransactions = (rawPdfRows: string[]) => {
  let transactions: Transaction[] = [];
  let temporaryTransaction: TemporaryTransaction | undefined;

  rawPdfRows.forEach((row) => {
    if (!row) {
      return;
    }
    const columns = row.split(ITEM_SEPARATOR);
    const isTransactionDate = row.match(/^(\d\d\/){2}\d{4}/);

    if (!isTransactionDate) {
      if (!temporaryTransaction) {
        return;
      }
      const isLastRowOfTransaction = columns[0].match(/\d\d\sTL/);
      if (isLastRowOfTransaction) {
        const { titlePieces, ...restTemporaryTransaction } =
          temporaryTransaction;

        const { currency, amount } = parseMoney(columns[0]);

        transactions.push({
          ...restTemporaryTransaction,
          title: titlePieces.join(' | '),
          currency,
          amount,
        });

        temporaryTransaction = undefined;
        return;
      } else {
        if (columns.length !== 1) {
          throw new Error(`Unknown column of table row: ${row}`);
        }
        temporaryTransaction.titlePieces.push(columns[0]);
      }
      return;
    }

    const isFullTransaction = columns.length === 8;
    if (isFullTransaction) {
      const { amount, currency } = parseMoney(columns[6]);
      transactions.push({
        createdAt: parseDate(columns[0], columns[1]),
        info: createTransactionInfo(columns[3], columns[4]),
        title: columns[5],
        amount,
        currency,
      });
      return;
    }

    const isIncompleteTransaction = columns.length === 5;
    if (isIncompleteTransaction) {
      temporaryTransaction = {
        createdAt: parseDate(columns[0], columns[1]),
        info: createTransactionInfo(columns[3], columns[4]),
        titlePieces: [],
      };
      return;
    }

    throw new Error(`Unknown table row: ${row}`);
  });

  return transactions;
};
