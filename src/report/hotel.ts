import { assert } from 'ts-essentials';

export class Hotel {
  constructor(
    public id: number,
    public district: string,
    public area: string,
    public name: string,
    public category: string,
    public validFrom: Date,
    public website: string | null
  ) {
    assert(id);
    assert(district);
    assert(area);
    assert(name);
    assert(category);
    assert(validFrom instanceof Date);
  }
}
