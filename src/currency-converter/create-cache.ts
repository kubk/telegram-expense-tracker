import { caching } from 'cache-manager';
import * as store from 'cache-manager-fs-hash';
import { isDev } from '../lib/env/env';

export const cache = caching({
  store: store,
  options: {
    path: `${__dirname}/../../cache`,
    ttl: 3600 * 24 * 30 * 12 * 10,
    zip: !isDev(),
  },
});
