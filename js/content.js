// Manages challenge packs, round generation, and challenge retrieval.
// Uses content/index.js, config.js, and js/rng.js.
// Used by game engine, router, challenge links, and self-test suite.

import { PACKS } from "../content/index.js";
import { CONFIG } from "../config.js";
import { seededShuffle } from "./rng.js";

/**
 * Retrieve a pack by its identifier ('b', 'd', etc.).
 * @param {string} packId
 * @param {Array} [packsList]
 * @returns {object|null}
 */
export function getPack(packId, packsList = PACKS) {
  return packsList.find((p) => p.id === packId) ?? null;
}

/**
 * Retrieve any challenge by its ID, including retired ones.
 * @param {string} id
 * @param {Array} [packsList]
 * @returns {object|null}
 */
export function getChallenge(id, packsList = PACKS) {
  for (const pack of packsList) {
    const found = pack.challenges.find((c) => c.id === id);
    if (found) return found;
  }
  return null;
}

/**
 * Get all challenges across all registered packs.
 * @param {Array} [packsList]
 * @returns {object[]}
 */
export function getAllChallenges(packsList = PACKS) {
  const all = [];
  for (const pack of packsList) {
    all.push(...pack.challenges);
  }
  return all;
}

/**
 * Build a game round for a pack.
 * Shuffles active challenges with rng, slices roundSize, orders by level.
 * @param {string} packId
 * @param {(() => number)} [rng]
 * @param {object} [packOverride]
 * @returns {object[]}
 */
export function buildRound(packId, rng = Math.random, packOverride = null) {
  const pack = packOverride ?? getPack(packId);
  if (!pack) return [];

  const active = pack.challenges.filter((c) => !c.retired);
  const shuffled = seededShuffle(active, rng);
  const size = CONFIG.roundSize ?? 8;
  const picked = shuffled.slice(0, size);

  // Stable sort by level ascending; preserves shuffled order within each level
  return [...picked].sort((a, b) => a.level - b.level);
}

/**
 * Generates the deterministic daily challenge set of IDs for a date.
 * @param {string} packId
 * @param {number|string} yyyymmdd
 * @param {object} [packOverride]
 * @returns {string[]} Challenge IDs
 */
export function dailySet(packId, yyyymmdd, packOverride = null) {
  const pack = packOverride ?? getPack(packId);
  if (!pack) return [];

  const active = pack.challenges.filter((c) => !c.retired);
  const shuffled = seededShuffle(active, yyyymmdd);
  const size = CONFIG.roundSize ?? 8;
  const picked = shuffled.slice(0, size);
  const sorted = [...picked].sort((a, b) => a.level - b.level);

  return sorted.map((c) => c.id);
}
