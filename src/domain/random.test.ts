import { createSeededRandom } from './random';

describe('createSeededRandom', () => {
  it('replays the same sequence for the same seed', () => {
    const first = createSeededRandom('repeatable');
    const second = createSeededRandom('repeatable');

    expect([first.next(), first.integer(1, 10), first.pick(['A', 'B', 'C'])]).toEqual([
      second.next(),
      second.integer(1, 10),
      second.pick(['A', 'B', 'C']),
    ]);
  });

  it('rejects an empty pick collection', () => {
    const random = createSeededRandom('empty');
    expect(() => random.pick([])).toThrow(/empty collection/i);
  });
});
