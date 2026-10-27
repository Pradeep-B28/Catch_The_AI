// High-precision countdown timer tracking active and paused duration without DOM code.
// Uses config.js for default snippet duration and performance.now() as clock source.
// Used by play screen, game engine, and verified by timer self-test checks.

import { CONFIG } from "../config.js";

/**
 * Default clock function returning fractional seconds.
 * @returns {number}
 */
function defaultClock() {
  return performance.now() / 1000;
}

/**
 * Create a new timer instance.
 * @param {object} [options]
 * @param {number} [options.totalSeconds]
 * @param {() => number} [options.clock]
 */
export function createTimer(options = {}) {
  const total = options.totalSeconds ?? CONFIG.secondsPerSnippet ?? 30;
  const clock = options.clock ?? defaultClock;

  let startTime = 0;
  let running = false;
  let paused = false;
  let pauseStart = 0;
  let totalPaused = 0;

  function start() {
    startTime = clock();
    running = true;
    paused = false;
    pauseStart = 0;
    totalPaused = 0;
  }

  function pause() {
    if (running && !paused) {
      paused = true;
      pauseStart = clock();
    }
  }

  function resume() {
    if (running && paused) {
      totalPaused += clock() - pauseStart;
      paused = false;
    }
  }

  function stop() {
    running = false;
  }

  function getActiveSeconds() {
    if (!running) return 0;
    const now = paused ? pauseStart : clock();
    return Math.max(0, now - startTime - totalPaused);
  }

  function getStatus() {
    const active = getActiveSeconds();
    const remaining = Math.max(0, total - active);
    const secondsShown = Math.ceil(remaining);
    const isWarning = remaining <= 5;
    const isExpired = remaining <= 0;
    const recordedSeconds = Math.round(active * 10) / 10;
    const progress = total > 0 ? remaining / total : 0;

    return {
      total,
      active,
      remaining,
      secondsShown,
      isWarning,
      isExpired,
      recordedSeconds,
      progress
    };
  }

  return {
    start,
    pause,
    resume,
    stop,
    getActiveSeconds,
    getStatus
  };
}
