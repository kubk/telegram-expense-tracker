import { parsePdfReport } from './report/report-parser';
import { readFileSync } from 'fs';

const dataBuffer = readFileSync('/tmp/Level1HotelList.pdf');
parsePdfReport(dataBuffer).then(console.log);
