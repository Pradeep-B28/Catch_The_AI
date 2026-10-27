// Starts the application, inspects URL parameters, initializes header controls, and runs the router.
// Uses config.js, content.js, selftest.js, fitcheck.js, screens/play.js, router.js, fx/sound.js, and events.js.
// Loaded directly by index.html as the primary application entry point.

import { CONFIG } from "../config.js";
import { getChallenge } from "./content.js";
import { toggleMute, isSoundMuted } from "./fx/sound.js";
import { on } from "./events.js";

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

async function init() {
  setupHeaderControls();

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

  // 2. All challenges fit check (?preview=all)
  if (params.get("preview") === "all") {
    const { runFitCheck } = await import("./fitcheck.js");
    await runFitCheck(container);
    return;
  }

  // 3. Special state previews for Phase 3 screenshots
  if (params.get("preview") === "typing") {
    const ch = getChallenge("b01");
    const { mountPlayScreen } = await import("./screens/play.js");
    mountPlayScreen(container, { challenge: ch, currentIndex: 0, total: 8 });
    return;
  }

  if (params.get("preview") === "picked") {
    const ch = getChallenge("b01");
    const { mountPlayScreen } = await import("./screens/play.js");
    const inst = mountPlayScreen(container, { challenge: ch, currentIndex: 0, total: 8 });
    inst.setLine(2);
    return;
  }

  if (params.get("preview") === "caught") {
    const ch = getChallenge("b01");
    const { mountPlayScreen } = await import("./screens/play.js");
    const inst = mountPlayScreen(container, { challenge: ch, currentIndex: 0, total: 8 });
    inst.triggerReveal({
      id: ch.id,
      index: 0,
      pickedLine: ch.bugLine,
      result: "caught",
      seconds: 8.2,
      challenge: ch
    });
    return;
  }

  if (params.get("preview") === "missed") {
    const ch = getChallenge("b01");
    const { mountPlayScreen } = await import("./screens/play.js");
    const inst = mountPlayScreen(container, { challenge: ch, currentIndex: 0, total: 8 });
    inst.triggerReveal({
      id: ch.id,
      index: 0,
      pickedLine: 1,
      result: "wrong",
      seconds: 14.5,
      challenge: ch
    });
    return;
  }

  if (params.get("preview") === "timeout") {
    const ch = getChallenge("b01");
    const { mountPlayScreen } = await import("./screens/play.js");
    const inst = mountPlayScreen(container, { challenge: ch, currentIndex: 0, total: 8 });
    inst.triggerReveal({
      id: ch.id,
      index: 0,
      pickedLine: null,
      result: "timeout",
      seconds: 30,
      challenge: ch
    });
    return;
  }

  if (params.get("preview") === "result") {
    const { mount: mountResult, enter: enterResult } = await import("./screens/result.js");
    mountResult(container, () => {});
    const sampleResults = [
      { id: "b01", result: "caught", seconds: 7.1, challenge: getChallenge("b01") },
      { id: "b02", result: "caught", seconds: 9.4, challenge: getChallenge("b02") },
      { id: "b03", result: "wrong", pickedLine: 1, seconds: 15.2, challenge: getChallenge("b03") },
      { id: "b04", result: "caught", seconds: 6.8, challenge: getChallenge("b04") },
      { id: "b05", result: "caught", seconds: 8.0, challenge: getChallenge("b05") },
      { id: "b06", result: "wrong", pickedLine: 2, seconds: 22.1, challenge: getChallenge("b06") },
      { id: "b07", result: "caught", seconds: 11.3, challenge: getChallenge("b07") },
      { id: "b08", result: "caught", seconds: 5.9, challenge: getChallenge("b08") }
    ];
    enterResult({
      packId: "b",
      total: 8,
      results: sampleResults
    });
    return;
  }

  // 4. Single challenge preview (?preview=<id>)
  if (params.has("preview")) {
    const id = params.get("preview");
    const challenge = getChallenge(id);
    if (challenge) {
      const { mountPlayScreen } = await import("./screens/play.js");
      mountPlayScreen(container, {
        challenge,
        currentIndex: 0,
        total: CONFIG.roundSize ?? 8,
        onAnswer: () => {}
      });
      return;
    }
  }

  // 4. Default interactive app router
  const router = await import("./router.js");
  router.init(container);
}

init();
