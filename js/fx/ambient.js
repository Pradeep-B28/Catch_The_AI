// Background ambient floating code symbols animation with tab visibility pausing.
// Uses DOM transforms and opacities; disables cleanly under reduced-motion.
// Used by the home screen and app background.

const SYMBOLS = ["{ }", "( )", ";", "=>", "[ ]", "</>"];

/**
 * Initializes and manages the floating ambient symbols container.
 * @param {HTMLElement} container Parent container
 * @returns {{ destroy: () => void }}
 */
export function initAmbient(container) {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || !container) {
    return { destroy: () => {} };
  }

  const wrap = document.createElement("div");
  wrap.className = "ambient-symbols-container";
  wrap.setAttribute("aria-hidden", "true");

  const elements = [];
  const symbolCount = 14;

  // Distribute symbols gently towards the flanks to keep center reading area clean
  for (let i = 0; i < symbolCount; i++) {
    const el = document.createElement("span");
    el.className = "ambient-symbol";
    el.textContent = SYMBOLS[i % SYMBOLS.length];

    // Half on left flank (2% - 28%), half on right flank (72% - 96%)
    const isLeft = i % 2 === 0;
    const baseCol = isLeft ? 2 + (i / symbolCount) * 48 : 72 + (i / symbolCount) * 44;
    const left = Math.max(2, Math.min(96, baseCol));
    const size = Math.floor(Math.random() * 5) + 14; // 14 to 18px
    const duration = Math.floor(Math.random() * 8) + 18; // 18 to 26s gentle float
    const delay = Math.random() * -24; // Stagger initial positions

    el.style.left = `${left}%`;
    el.style.fontSize = `${size}px`;
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${delay}s`;

    wrap.appendChild(el);
    elements.push(el);
  }

  container.appendChild(wrap);

  function handleVisibility() {
    const isHidden = document.hidden;
    wrap.style.animationPlayState = isHidden ? "paused" : "running";
    for (const el of elements) {
      el.style.animationPlayState = isHidden ? "paused" : "running";
    }
  }

  document.addEventListener("visibilitychange", handleVisibility);

  return {
    destroy: () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (wrap.parentNode) {
        wrap.parentNode.removeChild(wrap);
      }
    }
  };
}
