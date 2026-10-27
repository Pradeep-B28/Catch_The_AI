// Demo mode automation simulating real user gameplay with an animated tap dot.
// Uses content.js, screens/play.js, screens/result.js, copy.js, and events.js.
// Used for recording reels and social demos (?demo=1). Never saves scores or sends analytics.

import { getChallenge } from "./content.js";
import { mountPlayScreen } from "./screens/play.js";
import { mount as mountResult, enter as enterResult } from "./screens/result.js";

const DEMO_SETS = {
  b: ["b01", "b03", "b02", "b05", "b07", "b08", "b09", "b10"],
  d: ["d01", "d07", "d03", "d05", "d02", "d08", "d04", "d09"]
};

/**
 * Initializes and loops demo mode.
 * @param {HTMLElement} container
 */
export async function startDemoMode(container) {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") === "d" ? "d" : "b";
  const rawN = parseInt(params.get("n") || "8", 10);
  const n = Math.max(3, Math.min(8, isNaN(rawN) ? 8 : rawN));

  const snippetIds = DEMO_SETS[mode].slice(0, n);
  const challenges = snippetIds.map((id) => getChallenge(id)).filter(Boolean);

  // Apply theme if provided
  const themeParam = params.get("theme");
  if (themeParam === "light" || themeParam === "dark") {
    document.documentElement.setAttribute("data-theme", themeParam);
  }

  // Create or obtain animated tap dot
  let tapDot = document.getElementById("demo-tap-dot");
  if (!tapDot) {
    tapDot = document.createElement("div");
    tapDot.id = "demo-tap-dot";
    tapDot.className = "demo-tap-dot";
    tapDot.setAttribute("aria-hidden", "true");
    document.body.appendChild(tapDot);
  }

  function moveTapDot(targetEl, callback, delayBeforeTap = 400) {
    if (!targetEl) {
      if (callback) setTimeout(callback, 100);
      return;
    }
    const rect = targetEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    tapDot.style.opacity = "1";
    tapDot.style.left = `${cx}px`;
    tapDot.style.top = `${cy}px`;

    setTimeout(() => {
      // Tap pulse animation
      tapDot.classList.add("tapped");
      targetEl.click();
      setTimeout(() => {
        tapDot.classList.remove("tapped");
        if (callback) callback();
      }, 200);
    }, delayBeforeTap);
  }

  function hideTapDot() {
    tapDot.style.opacity = "0";
  }

  // --- Step 1: Home Screen Simulation ---
  const { enter: enterHome, mount: mountHome } = await import("./screens/home.js");
  mountHome(container, () => {});
  enterHome();

  setTimeout(() => {
    const modeBtn = container.querySelector(`.mode-card[data-pack="${mode}"]`);
    moveTapDot(modeBtn, () => {
      hideTapDot();
      setTimeout(() => {
        runSnippetLoop(0, []);
      }, 500);
    });
  }, 1200);

  // --- Step 2 to 4: Play and Reveal Snippets ---
  function runSnippetLoop(index, pastOutcomes) {
    if (index >= challenges.length) {
      // Step 5: Result Screen
      showDemoResult(pastOutcomes);
      return;
    }

    const currentChallenge = challenges[index];
    const isMiss = index === 2 || index === 5; // Snippet 3 and 6 miss
    const pickedLine = isMiss
      ? Math.max(1, currentChallenge.bugLine - 1)
      : currentChallenge.bugLine;

    const playInstance = mountPlayScreen(container, {
      challenge: currentChallenge,
      currentIndex: index,
      total: challenges.length,
      pastResults: pastOutcomes.map((o) => o.result),
      onAnswer: (outcome) => {
        pastOutcomes.push(outcome);
      },
      onNext: () => {
        hideTapDot();
        playInstance.leave();
        setTimeout(() => {
          runSnippetLoop(index + 1, pastOutcomes);
        }, 300);
      }
    });

    // 2.5s after typing starts, pick the line
    setTimeout(() => {
      const lineRows = container.querySelectorAll(".code-line-row");
      const targetRow = lineRows[pickedLine - 1];

      moveTapDot(targetRow, () => {
        // 0.6s later, tap the confirm button
        setTimeout(() => {
          const confirmBtn = container.querySelector(".confirm-btn");
          moveTapDot(confirmBtn, () => {
            hideTapDot();
            // Hold reveal for 3.5s so viewer can read
            setTimeout(() => {
              const nextBtn = container.querySelector(".reveal-next-btn");
              moveTapDot(nextBtn, () => {
                hideTapDot();
              });
            }, 3500);
          }, 300);
        }, 600);
      }, 300);
    }, 2500);
  }

  // --- Step 5: Result Screen Simulation & Restart Loop ---
  function showDemoResult(outcomes) {
    mountResult(container, () => {});
    enterResult({
      packId: mode,
      total: challenges.length,
      results: outcomes
    });

    hideTapDot();

    // Hold result screen for 4s
    setTimeout(() => {
      // Smooth scroll to CTA card
      const ctaCard = container.querySelector(".cta-card");
      if (ctaCard) {
        ctaCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Hold 3s on CTA
      setTimeout(() => {
        // Smooth scroll back up
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Hold 1.5s then restart demo loop
        setTimeout(() => {
          startDemoMode(container);
        }, 1500);
      }, 3000);
    }, 4000);
  }
}
