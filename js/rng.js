// Seeded pseudorandom number generator (mulberry32) and deterministic shuffle.
// Uses no external dependencies.
// Used by content.js for daily challenge sets, test fixtures, and reproducible rounds.

/**
 * Creates a mulberry32 PRNG returning numbers in [0, 1).
 * @param {number} seed
 * @returns {() => number}
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Performs a Fisher-Yates shuffle from the last index down to 1.
 * Picks j = Math.floor(rng() * (i + 1)).
 * @template T
 * @param {T[]} items
 * @param {number|(() => number)} seedOrRng
 * @returns {T[]} A new shuffled array
 */
export function seededShuffle(items, seedOrRng) {
  const copy = [...items];
  const rng = typeof seedOrRng === "function" ? seedOrRng : mulberry32(Number(seedOrRng));
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}
