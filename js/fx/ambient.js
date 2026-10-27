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

  for (let i = 0; i < symbolCount; i++) {
    const el = document.createElement("span");
    el.className = "ambient-symbol";
    el.textContent = SYMBOLS[i % SYMBOLS.length];

    const left = (i / symbolCount) * 100 + (Math.random() * 6 - 3);
    const size = Math.floor(Math.random() * 7) + 14; // 14 to 20px
    const duration = Math.floor(Math.random() * 9) + 12; // 12 to 20s
    const delay = Math.random() * -20; // Stagger initial positions

    el.style.left = `${Math.max(2, Math.min(96, left))}%`;
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
