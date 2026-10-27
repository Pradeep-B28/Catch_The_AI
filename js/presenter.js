// Presenter mode for live workshop / webinar screen sharing on Zoom or Google Meet.
// Uses content.js, screens/play.js, and events.js without analytics or saved scores.
// Activated via ?present=1 when config.features.presenterMode is enabled.

import { CONFIG } from "../config.js";
import { buildRound, getChallenge } from "./content.js";
import { mountPlayScreen } from "./screens/play.js";

/**
 * Starts Presenter Mode.
 * @param {HTMLElement} container
 */
export function startPresenterMode(container) {
  const params = new URLSearchParams(window.location.search);
  const packId = params.get("mode") === "d" ? "d" : "b";
  const challenges = buildRound(packId);

  let currentIndex = 0;
  let activeInstance = null;
  const results = [];

  function loadSnippet(idx) {
    if (activeInstance) {
      activeInstance.leave();
      activeInstance = null;
    }

    const challenge = challenges[idx];

    activeInstance = mountPlayScreen(container, {
      challenge,
      currentIndex: idx,
      total: challenges.length,
      pastResults: results.map((r) => r.result),
      onAnswer: (outcome) => {
        results.push(outcome);
      },
      onNext: () => {
        if (currentIndex < challenges.length - 1) {
          currentIndex += 1;
          loadSnippet(currentIndex);
        } else {
          showPresenterEnd();
        }
      }
    });

    // Enforce >= 20px font size for shared screen legibility
    const editorBody = container.querySelector(".code-editor-body");
    if (editorBody) {
      editorBody.style.fontSize = "20px";
    }

    // Keyboard shortcuts for presenter
    function handlePresenterKey(e) {
      // 1-9 to pick line
      if (/^[1-9]$/.test(e.key)) {
        const line = parseInt(e.key, 10);
        if (line <= challenge.code.length) {
          activeInstance.setLine(line);
        }
      } else if (e.key === "r" || e.key === "R") {
        // Reveal without pick
        activeInstance.triggerReveal({
          id: challenge.id,
          index: idx,
          pickedLine: null,
          result: "timeout",
          seconds: 0,
          challenge
        });
      }
    }

    window.addEventListener("keydown", handlePresenterKey, { once: true });
  }

  function showPresenterEnd() {
    while (container.firstChild) container.removeChild(container.firstChild);

    const endCard = document.createElement("div");
    endCard.className = "result-card-hero";
    endCard.style.padding = "3rem 1.5rem";

    const title = document.createElement("h2");
    title.textContent = "Round Complete";
    title.style.fontSize = "2rem";
    title.style.marginBottom = "1rem";
    endCard.appendChild(title);

    const q = document.createElement("p");
    q.textContent = "Questions? Ask in the chat.";
    q.style.fontSize = "1.5rem";
    q.style.color = "var(--brand-strong)";
    q.style.fontWeight = "700";
    endCard.appendChild(q);

    container.appendChild(endCard);
  }

  loadSnippet(0);
}
