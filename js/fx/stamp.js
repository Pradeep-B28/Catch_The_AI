// Renders the stylized CAUGHT stamp with single-bounce landing animation.
// Uses DOM elements and checks prefers-reduced-motion.
// Used by play reveal, home hero, and share canvas.

/**
 * Creates and attaches a CAUGHT stamp element.
 * @param {HTMLElement} parent
 * @param {object} [options]
 * @param {string} [options.text="CAUGHT"]
 * @param {boolean} [options.isSuccess=true]
 * @returns {HTMLElement}
 */
export function createStamp(parent, options = {}) {
  const text = options.text ?? "CAUGHT";
  const isSuccess = options.isSuccess ?? true;

  const stamp = document.createElement("div");
  stamp.className = `stamp-badge ${isSuccess ? "stamp-caught" : "stamp-missed"}`;
  stamp.textContent = text;
  stamp.setAttribute("aria-hidden", "true");

  parent.appendChild(stamp);
  return stamp;
}
