// Client-side screen router managing active view lifecycle across home, play, and result.
// Uses screens/home.js, screens/play.js, screens/result.js, links.js, and events.js.
// Coordinates screen transitions and emits application lifecycle events.

import * as homeScreen from "./screens/home.js";
import * as playScreen from "./screens/play.js";
import * as resultScreen from "./screens/result.js";
import { readChallenge } from "./links.js";
import { emit } from "./events.js";

const screens = {
  home: homeScreen,
  play: playScreen,
  result: resultScreen
};

let currentScreenName = null;
let container = null;

/**
 * Navigate to a registered screen.
 * @param {string} screenName
 * @param {object} [params]
 */
export function navigate(screenName, params = {}) {
  const targetScreen = screens[screenName];
  if (!targetScreen) {
    console.error(`Router error: Unknown screen "${screenName}"`);
    return;
  }

  if (currentScreenName && screens[currentScreenName]) {
    try {
      screens[currentScreenName].leave();
    } catch (err) {
      console.warn("Screen teardown warning:", err);
    }
  }

  currentScreenName = screenName;
  targetScreen.enter(params);
  window.scrollTo({ top: 0, behavior: "instant" });
  emit("screen:change", { screen: screenName, params });
}

/**
 * Initialize the router with the main container element.
 * @param {HTMLElement} rootContainer
 */
export function init(rootContainer) {
  container = rootContainer;

  // Mount container in all screens
  for (const screen of Object.values(screens)) {
    screen.mount(container, navigate);
  }

  // Inspect URL for challenge link
  let challengeData = null;
  if (window.location.search) {
    challengeData = readChallenge(window.location.search);
    if (challengeData) {
      window.__pendingChallenge = challengeData;
      // Remove query string quietly without reload
      try {
        window.history.replaceState({}, "", window.location.pathname);
      } catch {}
    }
  }

  // Navigate to home screen
  navigate("home", { challenge: challengeData });
  emit("app:ready", { screen: "home" });
}

export function getCurrentScreen() {
  return currentScreenName;
}
