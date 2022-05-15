import { caching } from 'cache-manager';
import * as store from 'cache-manager-fs-hash';
import { isDev } from '../lib/env/env';

export const createCache = (options: { cachePath: string; zip: boolean }) => {
  return caching({
    store: store,
    options: {
      path: options.cachePath,
      ttl: 3600 * 24 * 30 * 12 * 10,
      zip: options.zip,
    },
  });
};
