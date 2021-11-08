import * as pdfParse from 'pdf-parse';
import { Hotel } from './hotel';

const ITEM_SEPARATOR = '---';
const ROW_SEPARATOR = '\n';

const renderPage: pdfParse.Options['pagerender'] = (pageData) => {
  const options = {
    normalizeWhitespace: true,
    disableCombineTextItems: true,
  };

  return pageData.getTextContent(options).then((textContent: any) => {
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

export const parsePdfReport = async (pdf: Buffer): Promise<Hotel[]> => {
  const data = await pdfParse(pdf, { pagerender: renderPage });
  const text = data.text;
  const result = text
    .split(ROW_SEPARATOR)
    .map((row) => (row.startsWith(ITEM_SEPARATOR) ? row.substring(3) : row))
    .filter((row) => (row ? row.match(/^\d+/) : false));

  return result.map((row) => {
    const [id, district, area, name, category, validFrom, website] =
      row.split(ITEM_SEPARATOR);

    return new Hotel(
      parseInt(id),
      district,
      area,
      name,
      category,
      new Date(),
      website
    );
  });
};
