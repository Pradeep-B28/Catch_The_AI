// Generates, parses, and validates challenge links, sales WhatsApp URLs, and site links.
// Uses config.js and content.js for pack and challenge lookups.
// Used by router, CTA cards, share sheet, and self-test suite.

import { CONFIG } from "../config.js";
import { PACKS } from "../content/index.js";

/**
 * Validates whether a phone number string meets the 11-15 digit country-coded requirement.
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  return typeof phone === "string" && /^\d{11,15}$/.test(phone);
}

/**
 * Builds a challenge deep link.
 * @param {string} origin
 * @param {string[]} ids
 * @param {number} score
 * @returns {string}
 */
export function challengeLink(origin, ids, score) {
  const base = origin || CONFIG.siteUrl || (typeof window !== "undefined" ? window.location.origin : "");
  const trimmed = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${trimmed}/?set=${ids.join(".")}&beat=${score}`;
}

/**
 * Finds which pack contains a challenge ID (including retired ones).
 * @param {string} id
 * @param {Array} [packs]
 * @returns {string|null}
 */
function getPackForId(id, packs = PACKS) {
  for (const pack of packs) {
    if (pack.challenges.some((c) => c.id === id)) {
      return pack.id;
    }
  }
  return null;
}

/**
 * Parses and strictly validates a challenge query string.
 * Returns { packId, ids, beat } if valid, or null if invalid.
 * @param {string} search
 * @param {Array} [packs]
 * @returns {{ packId: string, ids: string[], beat: number|null }|null}
 */
export function readChallenge(search, packs = PACKS) {
  if (!search) return null;
  const query = search.startsWith("?") ? search.slice(1) : search;
  if (!query) return null;

  const params = new URLSearchParams(query);
  if (!params.has("set")) return null;

  const rawSet = params.get("set");
  if (!rawSet) return null;

  const ids = rawSet.split(".");
  if (ids.length < 3 || ids.length > 20) return null;

  let packId = null;
  const seen = new Set();

  for (const id of ids) {
    // Must be lowercase alphanumeric only
    if (!/^[a-z0-9]+$/.test(id)) return null;
    if (seen.has(id)) return null;
    seen.add(id);

    const foundPack = getPackForId(id, packs);
    if (!foundPack) return null;

    if (packId === null) {
      packId = foundPack;
    } else if (packId !== foundPack) {
      return null;
    }
  }

  let beat = null;
  if (params.has("beat")) {
    const rawBeat = params.get("beat");
    if (!/^\d+$/.test(rawBeat)) return null;
    const num = parseInt(rawBeat, 10);
    if (num < 0 || num > ids.length) return null;
    beat = num;
  }

  return { packId, ids, beat };
}

/**
 * Builds the sales team WhatsApp URL with prefilled score message.
 * Returns empty string if phone number is invalid.
 * @param {string} phone
 * @param {string} mode e.g. "Beginner" or "Developer"
 * @param {number} score
 * @param {number} total
 * @returns {string}
 */
export function salesUrl(phone, mode, score, total) {
  const number = phone || CONFIG.salesWhatsApp;
  if (!isValidPhone(number)) return "";

  const course = CONFIG.courseName;
  const text = `Hi, I just played Catch the AI on ${mode} mode and caught ${score} of ${total} mistakes. I'd like to know more about the ${course}.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/**
 * Builds the share text for clipboard and WhatsApp sharing.
 * @param {number} score
 * @param {number} total
 * @param {string} link
 * @returns {string}
 */
export function shareText(score, total, link) {
  if (score === total) {
    return `AI wrote ${total} pieces of code, each with a hidden mistake. I caught all ${total}. Can you match that? ${link}`;
  }
  return `AI wrote ${total} pieces of code, each with a hidden mistake. I caught ${score}. Can you beat me? ${link}`;
}

/**
 * Builds the WhatsApp web intent URL for sharing.
 * @param {string} text
 * @returns {string}
 */
export function shareWhatsAppUrl(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Builds a trackable website URL with UTM parameters.
 * @param {"home"|"result"|"footer"} spot
 * @returns {string}
 */
export function websiteUrl(spot = "home") {
  const base = CONFIG.website || "https://wrench-wise.com/";
  const u = new URL(base);
  if (CONFIG.utm) {
    u.searchParams.set("utm_source", CONFIG.utm.source);
    u.searchParams.set("utm_medium", CONFIG.utm.medium);
    u.searchParams.set("utm_campaign", CONFIG.utm.campaign);
  }
  u.searchParams.set("utm_content", spot);
  return u.toString();
}
