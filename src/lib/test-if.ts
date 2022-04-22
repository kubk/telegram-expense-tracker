// Jest doesn't allow skipping tests programmatically, that's why we do it here
export const testIf = (
  condition: () => boolean,
  name: string,
  callback: () => void
) => {
  const testOrSkip = condition() ? test : test.skip;

  testOrSkip(name, callback);
};
