import * as pdfParse from 'pdf-parse';
import { assembleTransactions } from './assemble-transactions';
import { ITEM_SEPARATOR, ROW_SEPARATOR } from './constants';

const options = {
  normalizeWhitespace: true,
  disableCombineTextItems: true,
};

// https://www.npmjs.com/package/pdf-parse#extend
const renderPage: pdfParse.Options['pagerender'] = (pageData) => {
  return pageData
    .getTextContent(options)
    .then((textContent: { items: any }) => {
      let lastY = undefined;
      let text = '';
      for (const item of textContent.items) {
        if (lastY == item.transform[5] || !lastY) {
          text += ITEM_SEPARATOR + item.str;
        } else {
          text += ROW_SEPARATOR + item.str;
        }
        lastY = item.transform[5];
      }
      return text;
    });
};

export const parseTransactions = async (pdf: Buffer) => {
  const data = await pdfParse(pdf, { pagerender: renderPage });
  const result = data.text.split(ROW_SEPARATOR);

  return assembleTransactions(result);
};
