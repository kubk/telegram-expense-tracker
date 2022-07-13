import { createCurrencyConverter } from './create-currency-converter';
import { cache } from './create-cache';

export const convertCurrency = createCurrencyConverter(cache);
