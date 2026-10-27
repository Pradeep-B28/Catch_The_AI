// Home screen professional hero editor animation looping through b01, d07, and b03.
// Uses content.js, highlight.js, and fx/stamp.js.
// Used by the home screen to showcase the core value proposition.

import { getChallenge } from "../content.js";
import { highlightLine } from "../highlight.js";
import { createStamp } from "./stamp.js";

const SNIPPET_IDS = ["b01", "d07", "b03"];

/**
 * Mount and animate the home screen hero editor.
 * @param {HTMLElement} container
 * @returns {{ destroy: () => void }}
 */
export function initHeroEditor(container) {
  let isDestroyed = false;
  let loopTimeout = null;
  let snippetIdx = 0;

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const card = document.createElement("div");
  card.className = "hero-editor-card";

  // Title bar
  const titlebar = document.createElement("div");
  titlebar.className = "code-titlebar";
  const titleLeft = document.createElement("div");
  titleLeft.className = "titlebar-left";

  const dots = document.createElement("div");
  dots.className = "editor-dots";
  for (let i = 0; i < 3; i++) {
    const d = document.createElement("span");
    d.className = "editor-dot";
    dots.appendChild(d);
  }
  const fname = document.createElement("span");
  fname.className = "editor-filename";
  fname.textContent = "ai-wrote-this.js";

  titleLeft.appendChild(dots);
  titleLeft.appendChild(fname);
  titlebar.appendChild(titleLeft);
  card.appendChild(titlebar);

  // Scanline overlay
  const scanLine = document.createElement("div");
  scanLine.className = "hero-scan-line";
  card.appendChild(scanLine);

  // Body container
  const body = document.createElement("div");
  body.className = "code-editor-body";
  card.appendChild(body);

  container.appendChild(card);

  // Render static line row
  function renderSnippetLine(text, lineNum, isBug = false, isGlitch = false) {
    const row = document.createElement("div");
    row.className = "code-line-row";
    if (isBug) row.classList.add("bug-line");
    if (isGlitch) row.classList.add("glitch-line");

    const gutter = document.createElement("span");
    gutter.className = "code-line-gutter";
    gutter.textContent = String(lineNum);
    row.appendChild(gutter);

    const content = document.createElement("div");
    content.className = "code-line-content";
    const textWrap = document.createElement("div");
    textWrap.className = "code-line-text";
    textWrap.appendChild(highlightLine(text));
    content.appendChild(textWrap);
    row.appendChild(content);

    return row;
  }

  function playStep() {
    if (isDestroyed) return;
    const challenge = getChallenge(SNIPPET_IDS[snippetIdx]);
    if (!challenge) return;

    while (body.firstChild) body.removeChild(body.firstChild);
    scanLine.classList.remove("scanning");
    card.classList.remove("hero-fading");

    if (reducedMotion) {
      challenge.code.forEach((line, idx) => {
        const lineNum = idx + 1;
        const isBug = lineNum === challenge.bugLine;
        const row = renderSnippetLine(line, lineNum, isBug);
        if (isBug) {
          row.classList.add("caught-line");
          createStamp(row, { text: "CAUGHT", isSuccess: true });
        }
        body.appendChild(row);
      });
      return;
    }

    // 1. Typing phase: 25ms per char, max 1.6s
    const totalChars = challenge.code.reduce((s, l) => s + l.length, 0);
    const interval = Math.min(25, Math.floor(1600 / Math.max(1, totalChars)));

    let lIdx = 0;
    let cIdx = 0;
    const currentLines = challenge.code.map(() => "");

    function renderCurrentTyping() {
      while (body.firstChild) body.removeChild(body.firstChild);
      currentLines.forEach((t, i) => {
        const row = renderSnippetLine(t, i + 1);
        if (i === lIdx) {
          const cur = document.createElement("span");
          cur.className = "code-cursor";
          row.querySelector(".code-line-text")?.appendChild(cur);
        }
        body.appendChild(row);
      });
    }

    const typingTimer = setInterval(() => {
      if (isDestroyed) {
        clearInterval(typingTimer);
        return;
      }
      if (lIdx < challenge.code.length) {
        const fullLine = challenge.code[lIdx];
        if (cIdx < fullLine.length) {
          cIdx += 1;
          currentLines[lIdx] = fullLine.slice(0, cIdx);
        } else {
          lIdx += 1;
          cIdx = 0;
        }
        renderCurrentTyping();
      } else {
        clearInterval(typingTimer);
        onTypingDone();
      }
    }, interval);

    function onTypingDone() {
      // 2. Scanline sweeps in 0.9s
      scanLine.classList.add("scanning");

      loopTimeout = setTimeout(() => {
        if (isDestroyed) return;
        scanLine.classList.remove("scanning");

        // 3. Glitch & bug flash
        const rows = body.querySelectorAll(".code-line-row");
        const bugRow = rows[challenge.bugLine - 1];
        if (bugRow) {
          bugRow.classList.add("bug-flash");
          bugRow.classList.add("glitch");
        }

        // 4. CAUGHT stamp lands near bug line
        loopTimeout = setTimeout(() => {
          if (isDestroyed) return;
          if (bugRow) {
            bugRow.classList.remove("glitch");
            bugRow.classList.add("caught-line");
            createStamp(bugRow, { text: "CAUGHT", isSuccess: true });
          }

          // 5. Hold 1.2s, fade out, next snippet
          loopTimeout = setTimeout(() => {
            if (isDestroyed) return;
            card.classList.add("hero-fading");

            loopTimeout = setTimeout(() => {
              if (isDestroyed) return;
              snippetIdx = (snippetIdx + 1) % SNIPPET_IDS.length;
              playStep();
            }, 400);
          }, 1200);
        }, 200);
      }, 900);
    }
  }

  playStep();

  return {
    destroy: () => {
      isDestroyed = true;
      if (loopTimeout) clearTimeout(loopTimeout);
      if (card.parentNode) card.parentNode.removeChild(card);
    }
  };
}
