import { assembleTransactions } from './assemble-transactions';

const report = [
  '',
  '',
  '___Name and Last',
  'Name',
  ':___EGOR GORBACHEV',
  'Customer Number___ ___:___72823002',
  'Branch___ ___:___1092-MAHMUTLAR ŞUBESİ',
  'Account Name___ ___:___Current Account TL___ ',
  'Date Range___ ___:___01/04/2022 - 30/04/2022',
  ' ',
  ' ',
  'Date___Time___ ___Transaction___Channel___Description',
  'Transaction',
  'Amount',
  'Balance',
  '______-- _________--Other Pending Transactions___0,00 TL___-',
  '04/04/2022___16:58:35___ ___Other___Other___POS TMSZ MIGROS ATATURK 6254 0404___-27,88 TL___6.179,72 TL',
  '04/04/2022___16:50:20___ ___Other___Other',
  'POS TMSZ MJET MAHMUTLAR 6254',
  '0404',
  '-55,98 TL___6.207,60 TL',
  '04/04/2022___16:29:25___ ___Other___Other___POS TMSZ ATOM MASTER 6254 0404___-21,00 TL___6.263,58 TL',
  '03/04/2022___23:25:59___ ___Other___Other',
  'EPOS IYZICO AMAZO*AMAZON 6254',
  '0304',
  '-187,32 TL___6.284,58 TL',
  '03/04/2022___16:21:13___ ___Other___Other___POS TMSZ MIGROS ATATURK 6254 0304___-45,02 TL___6.471,90 TL',
  '02/04/2022___12:00:34___ ___Other___Other___POS TMSZ MIGROS ATATURK 6254 0204___-105,17 TL___6.516,92 TL',
  '02/04/2022___11:55:16___ ___Other___Other___POS TMSZ CRYPTO ILETISIM 6254 0204___-160,00 TL___6.622,09 TL',
  '02/04/2022___11:45:32___ ___Other___Other___POS TMSZ OZ BALLI MANAV 6254 0204___-91,54 TL___6.782,09 TL',
  '02/04/2022___11:38:12___ ___Other___Other___POS TMSZ BIM-50. YIL -J7 6254 0204___-39,00 TL___6.873,63 TL',
  '02/04/2022___11:37:38___ ___Other___Other___POS TMSZ BIM-50. YIL -J7 6254 0204___-39,00 TL___6.912,63 TL',
  '02/04/2022___11:32:28___ ___Other___Other___POS TMSZ MAVI MARKET 6254 0204___-21,89 TL___6.951,63 TL',
  '01/04/2022___13:47:03___ ___Other___Internet - Mobile___DOVIZ ISLEM KMV___-6,51 TL___6.973,52 TL',
  '01/04/2022___13:47:03___ ___Other___Internet - Mobile___DOVIZ ISLEM KMV___-10.234,00 TL___6.973,52 TL',
  '01/04/2022___13:47:03___ ___Foreign Exchange___Internet - Mobile___USD MOBIL DOVIZ ALIS 14.79654___-3.255,24 TL___6.980,03 TL',
  '01/04/2022___10:24:02___ ___Money Transfer___Other',
  'GELEN EFT - BİRLEŞİK ÖDEME',
  'HİZMETLERİ VE ELEKTRONİK PARA A.Ş. -',
  'PYS537336797846 - transfer.',
  '4.150,34 TL___10.235,27 TL',
  ' ',
  ' ',
  'Yapı ve Kredi Bankası A.Ş.',
  'www.yapikredi.com.tr',
  ' ___ ___Ticaret Sicil Numarası: 32736___ ',
  ' ___ ___İşletmenin Merkezi: Yapıkredi Plaza',
  'D Blok___ 34330 ___Levent - İstanbul___ ',
  ' ___ ',
  ' ',
  ' ',
  '1___/___1',
  ' ',
  'Account Transactions',
  ' ',
  ' ',
];

test('assemble 14 transactions from an array of parsed PDF', () => {
  let result = assembleTransactions(report);
  expect(result).toHaveLength(15);
});
