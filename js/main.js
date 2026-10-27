// Starts the application, inspects URL parameters, initializes header controls, and runs the router.
// Uses config.js, selftest.js, router.js, demo.js, presenter.js, analytics.js, fx/sound.js, and events.js.
// Loaded directly by index.html as the primary application entry point.

import { CONFIG } from "../config.js";
import { toggleMute, isSoundMuted } from "./fx/sound.js";
import { on } from "./events.js";
import { initAnalytics } from "./analytics.js";

function setupHeaderControls() {
  // --- Sound Toggle ---
  const soundBtn = document.getElementById("sound-btn");
  const soundOnIcon = document.getElementById("sound-icon-on");
  const soundMutedIcon = document.getElementById("sound-icon-muted");

  function updateSoundUI(muted) {
    if (!soundBtn) return;
    soundBtn.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
    soundBtn.setAttribute("title", muted ? "Unmute sound" : "Mute sound");
    if (soundOnIcon) soundOnIcon.hidden = muted;
    if (soundMutedIcon) soundMutedIcon.hidden = !muted;
  }

  if (soundBtn) {
    updateSoundUI(isSoundMuted());
    soundBtn.addEventListener("click", () => {
      const nextMuted = toggleMute();
      updateSoundUI(nextMuted);
    });
    on("sound:toggle", ({ muted }) => {
      updateSoundUI(muted);
    });
  }

  // --- Theme Toggle ---
  const themeBtn = document.getElementById("theme-btn");
  const sunIcon = document.getElementById("theme-icon-sun");
  const moonIcon = document.getElementById("theme-icon-moon");

  let currentTheme = "light";
  try {
    const saved = window.localStorage ? window.localStorage.getItem("cta-theme") : null;
    if (saved === "light" || saved === "dark") {
      currentTheme = saved;
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      currentTheme = "dark";
    }
  } catch {
    currentTheme = "light";
  }

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    const isDark = theme === "dark";
    if (themeBtn) {
      themeBtn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
      themeBtn.setAttribute("title", isDark ? "Switch to light theme" : "Switch to dark theme");
    }
    if (sunIcon) sunIcon.hidden = !isDark;
    if (moonIcon) moonIcon.hidden = isDark;
  }

  applyTheme(currentTheme);

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      try {
        if (window.localStorage) {
          window.localStorage.setItem("cta-theme", nextTheme);
        }
      } catch {}
    });
  }
}

function setupAccessibilityAnnouncer() {
  const announcer = document.getElementById("aria-announcer");
  if (!announcer) return;

  on("snippet:answered", ({ result, challenge, pickedLine }) => {
    if (result === "caught") {
      announcer.textContent = `Caught it! Mistake was on line ${challenge.bugLine}.`;
    } else if (result === "wrong") {
      announcer.textContent = `This one got past you. You picked line ${pickedLine}, but mistake was on line ${challenge.bugLine}.`;
    } else if (result === "timeout") {
      announcer.textContent = `Time is up. Mistake was on line ${challenge.bugLine}.`;
    }
  });

  on("round:done", ({ score, total }) => {
    announcer.textContent = `Round completed. You caught ${score} of ${total} mistakes.`;
  });
}

async function init() {
  setupHeaderControls();
  setupAccessibilityAnnouncer();

  const params = new URLSearchParams(window.location.search);
  const container = document.getElementById("main-content");

  // 1. Self-test mode (?test=1)
  if (params.get("test") === "1") {
    const { runSelfTest, renderTestReport } = await import("./selftest.js");
    const testData = await runSelfTest();
    console.info(`Catch the AI Test Suite v${testData.version} - Result: ${testData.allPass ? "ALL PASS" : "FAIL"}`);
    console.table(testData.results);
    renderTestReport(container, testData);
    return;
  }

  // 2. Demo mode (?demo=1)
  if (params.get("demo") === "1") {
    const { startDemoMode } = await import("./demo.js");
    startDemoMode(container);
    return;
  }

  // 3. Presenter mode (?present=1)
  if (params.get("present") === "1" && CONFIG.features.presenterMode) {
    const { startPresenterMode } = await import("./presenter.js");
    startPresenterMode(container);
    return;
  }

  // 4. Initialize analytics
  initAnalytics();

  // 5. Default interactive app router
  const router = await import("./router.js");
  router.init(container);
}

init();
