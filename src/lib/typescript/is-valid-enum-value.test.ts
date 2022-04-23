import { Currency } from '@prisma/client';
import { assert, IsExact } from 'conditional-type-checks';
import { isValidEnumValue } from './is-valid-enum-value';

test('check valid enum value with type inference', () => {
  const param = 'TRY' as unknown;

  expect(isValidEnumValue(param, Currency)).toBeTruthy();

  // Type inference works
  if (isValidEnumValue(param, Currency)) {
    assert<IsExact<typeof param, Currency>>(true);
  } else {
    assert<IsExact<typeof param, Currency>>(false);
  }
});
