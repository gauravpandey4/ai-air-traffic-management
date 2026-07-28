function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export type RandomSource = {
  next: () => number;
  integer: (minimum: number, maximum: number) => number;
  pick: <T>(values: readonly T[]) => T;
};

export function createSeededRandom(seed: string): RandomSource {
  let state = hashSeed(seed);

  const next = () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };

  return {
    next,
    integer: (minimum, maximum) => Math.floor(next() * (maximum - minimum + 1)) + minimum,
    pick: <T>(values: readonly T[]) => {
      const value = values[Math.floor(next() * values.length)];
      if (value === undefined) {
        throw new Error('Cannot pick from an empty collection.');
      }
      return value;
    },
  };
}
