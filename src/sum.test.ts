import { sum } from './sum';

describe('sum', () => {
  it('can sum numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
