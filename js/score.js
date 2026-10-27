// Pure calculation of score ranks, result lines, head-to-head summaries, and missed concepts.
// Uses copy.js for UI copy interpolation and content.js for challenge lookups.
// Used by result screen, share card, analytics, and self-test suite.

import { t } from "./copy.js";
import { getChallenge } from "./content.js";

/**
 * Calculates rank title based on score percentage.
 * @param {number} score
 * @param {number} total
 * @returns {string} Rank title
 */
export function rank(score, total) {
  if (total <= 0) return t("rank.freshEyes");
  if (score >= total) return t("rank.toughest");
  const pct = score / total;
  if (pct >= 0.85) return t("rank.bugHunter");
  if (pct >= 0.60) return t("rank.sharpReviewer");
  if (pct >= 0.35) return t("rank.gettingSharp");
  return t("rank.freshEyes");
}

/**
 * Builds the primary result line describing player performance.
 * @param {number} score
 * @param {number} total
 * @returns {string}
 */
export function resultLine(score, total) {
  if (score === 0) {
    return t("result.lineZero", { total });
  }
  if (score === total) {
    return t("result.lineAll", { total });
  }
  return t("result.lineSome", { total, score });
}

/**
 * Builds the head-to-head comparison line against a friend's beat score.
 * @param {number} you
 * @param {number} friend
 * @returns {string}
 */
export function headToHeadLine(you, friend) {
  if (you > friend) {
    return t("h2h.win", { you, friend });
  }
  if (you === friend) {
    return t("h2h.tie", { score: you });
  }
  return t("h2h.loss", { you, friend });
}

/**
 * Extracts up to 4 unique concepts from missed snippets in played order.
 * @param {Array<{ id?: string, concept?: string, challenge?: object, result: string }>} results
 * @returns {string[]}
 */
export function missedConcepts(results) {
  const concepts = [];
  const seen = new Set();

  for (const item of results) {
    if (item.result === "caught") continue;

    let conceptName = item.concept;
    if (!conceptName && item.challenge?.concept) {
      conceptName = item.challenge.concept;
    }
    if (!conceptName && item.id) {
      const ch = getChallenge(item.id);
      conceptName = ch?.concept;
    }

    if (conceptName && !seen.has(conceptName)) {
      seen.add(conceptName);
      concepts.push(conceptName);
      if (concepts.length === 4) break;
    }
  }

  return concepts;
}

/**
 * Calculates average catch time for caught snippets, rounded to 1 decimal place.
 * Returns null if no snippets were caught.
 * @param {number[]} times
 * @returns {string|null}
 */
export function averageCatchTime(times) {
  if (!times || times.length === 0) return null;
  const sum = times.reduce((acc, curr) => acc + curr, 0);
  const avg = sum / times.length;
  return avg.toFixed(1);
}
