import { assert, IsExact } from 'conditional-type-checks';
import { boolNarrow } from './bool-narrow';

test('boolNarrow', () => {
  // .filter(Boolean) gives incorrect TS result - Array<number | null>
  const list = [100 > 10 ? 1 : null, 100 > 12 ? 1 : null].filter(Boolean);
  assert<IsExact<typeof list, Array<number | null>>>(true);

  // .filter(boolNarrow) gives correct TS result - Array<number>
  const listNarrowedType = [100 > 10 ? 1 : null, 100 > 12 ? 1 : null].filter(
    boolNarrow
  );
  assert<IsExact<typeof listNarrowedType, Array<number>>>(true);
});
