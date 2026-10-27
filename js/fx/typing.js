// AI typing effect simulator with character-by-character rendering and instant skip.
// Uses requestAnimationFrame for frame timing and checks prefers-reduced-motion.
// Used by play screen and home hero animation.

/**
 * Runs the AI typing effect on a set of code lines.
 * @param {object} options
 * @param {string[]} options.lines Array of full code lines
 * @param {(typedLines: string[], activeLineIndex: number, activeCharIndex: number) => void} options.onProgress
 * @param {() => void} options.onComplete
 * @returns {{ cancel: () => void, finishImmediately: () => void }}
 */
export function startTyping({ lines, onProgress, onComplete }) {
  let isDone = false;
  let rafId = null;

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function finishImmediately() {
    if (isDone) return;
    isDone = true;
    if (rafId) cancelAnimationFrame(rafId);
    onProgress([...lines], lines.length - 1, (lines[lines.length - 1] ?? "").length);
    onComplete();
  }

  if (reducedMotion) {
    finishImmediately();
    return { cancel: () => {}, finishImmediately: () => {} };
  }

  // Calculate speed: 18 ms per char, at most 1.6s (1600ms) total
  const totalChars = lines.reduce((sum, line) => sum + line.length, 0);
  const charIntervalMs = Math.min(18, Math.max(4, Math.floor(1600 / Math.max(1, totalChars))));

  let lineIdx = 0;
  let charIdx = 0;
  let lastTime = performance.now();
  let accumulated = 0;

  // Initialize display state
  const currentLines = lines.map(() => "");

  function step(now) {
    if (isDone) return;

    const delta = Math.min(50, now - lastTime);
    lastTime = now;
    accumulated += delta;

    while (accumulated >= charIntervalMs) {
      accumulated -= charIntervalMs;

      if (lineIdx < lines.length) {
        const targetLine = lines[lineIdx];
        if (charIdx < targetLine.length) {
          charIdx += 1;
          currentLines[lineIdx] = targetLine.slice(0, charIdx);
        } else {
          // Advance to next line
          lineIdx += 1;
          charIdx = 0;
        }
      } else {
        finishImmediately();
        return;
      }
    }

    onProgress([...currentLines], lineIdx, charIdx);

    if (!isDone) {
      rafId = requestAnimationFrame(step);
    }
  }

  rafId = requestAnimationFrame(step);

  return {
    cancel: () => {
      isDone = true;
      if (rafId) cancelAnimationFrame(rafId);
    },
    finishImmediately
  };
}
