// Home screen view rendering hero editor, ambient code symbols, mode cards, and session card.
// Uses fx/hero.js, fx/ambient.js, content.js, copy.js, and events.js.
// Used by router to present the initial entry screen.

import { CONFIG } from "../../config.js";
import { t } from "../copy.js";
import { getPack } from "../content.js";
import { initHeroEditor } from "../fx/hero.js";
import { initAmbient } from "../fx/ambient.js";
import { emit } from "../events.js";

let ambientHandle = null;
let heroHandle = null;
let currentRoot = null;
let navigateFn = null;

/**
 * Mount the home screen into the container.
 * @param {HTMLElement} root
 * @param {Function} navigate
 */
export function mount(root, navigate) {
  currentRoot = root;
  navigateFn = navigate;
}

/**
 * Enter the home screen and build the view.
 * @param {object} [params]
 * @param {object} [params.challenge] Challenge data from query if present
 */
export function enter(params = {}) {
  if (!currentRoot) return;

  // Clear root safely
  while (currentRoot.firstChild) {
    currentRoot.removeChild(currentRoot.firstChild);
  }

  // Start ambient floating symbols
  const ambientWrap = document.createElement("div");
  currentRoot.appendChild(ambientWrap);
  ambientHandle = initAmbient(ambientWrap);

  // Main Home Layout container
  const layout = document.createElement("div");
  layout.className = "home-layout";

  // Left/Main content column
  const contentCol = document.createElement("div");
  contentCol.className = "home-content";

  // Eyebrow chip
  const eyebrow = document.createElement("span");
  eyebrow.className = "chip home-eyebrow";
  eyebrow.textContent = t("home.eyebrow");
  contentCol.appendChild(eyebrow);

  // Title
  const title = document.createElement("h1");
  title.className = "home-title";
  title.textContent = t("home.title");
  contentCol.appendChild(title);

  // Subtitle
  const subtitle = document.createElement("p");
  subtitle.className = "home-subtitle";
  subtitle.textContent = t("home.subtitle", { total: CONFIG.roundSize ?? 8 });
  contentCol.appendChild(subtitle);

  // Optional Challenge banner (Section 6G)
  const challenge = params.challenge || window.__pendingChallenge;
  if (challenge && CONFIG.features.challengeLinks) {
    const pack = getPack(challenge.packId);
    const packName = pack ? pack.name : challenge.packId;
    const banner = document.createElement("div");
    banner.className = "challenge-banner";

    const bannerText = document.createElement("div");
    bannerText.className = "banner-text";
    if (typeof challenge.beat === "number") {
      bannerText.textContent = t("home.challengeBeat", {
        beat: challenge.beat,
        total: challenge.ids.length,
        mode: packName
      });
    } else {
      bannerText.textContent = t("home.challengeSet", {
        total: challenge.ids.length,
        mode: packName
      });
    }
    banner.appendChild(bannerText);

    const bannerBtn = document.createElement("button");
    bannerBtn.type = "button";
    bannerBtn.className = "btn btn-primary";
    bannerBtn.textContent = t("home.challengeBtn");
    bannerBtn.addEventListener("click", () => {
      if (navigateFn) {
        navigateFn("play", {
          packId: challenge.packId,
          challengeSet: challenge.ids,
          beat: challenge.beat
        });
      }
    });
    banner.appendChild(bannerBtn);
    contentCol.appendChild(banner);
  }

  // Mode Cards Grid
  const modeGrid = document.createElement("div");
  modeGrid.className = "mode-cards-grid";

  // Safe read of cta-best from localStorage
  let bestScores = {};
  try {
    const raw = window.localStorage ? window.localStorage.getItem("cta-best") : null;
    if (raw) bestScores = JSON.parse(raw);
  } catch {}

  const packs = CONFIG.packsOnHome || ["b", "d"];
  for (const packId of packs) {
    const pack = getPack(packId);
    if (!pack) continue;

    const card = document.createElement("button");
    card.type = "button";
    card.className = "mode-card";
    card.setAttribute("data-pack", packId);

    const cardHeader = document.createElement("div");
    cardHeader.className = "mode-card-header";

    const cardTitle = document.createElement("span");
    cardTitle.className = "mode-card-title";
    cardTitle.textContent = pack.name;
    cardHeader.appendChild(cardTitle);

    card.appendChild(cardHeader);

    const cardTagline = document.createElement("span");
    cardTagline.className = "mode-card-tagline";
    cardTagline.textContent = pack.tagline;
    card.appendChild(cardTagline);

    if (typeof bestScores[packId] === "number") {
      const bestSpan = document.createElement("span");
      bestSpan.className = "mode-card-best";
      bestSpan.textContent = t("home.best", {
        score: bestScores[packId],
        total: CONFIG.roundSize ?? 8
      });
      card.appendChild(bestSpan);
    }

    card.addEventListener("click", () => {
      emit("pack:selected", { packId });
      if (navigateFn) {
        navigateFn("play", { packId });
      }
    });

    modeGrid.appendChild(card);
  }
  contentCol.appendChild(modeGrid);

  // How to play card
  const howCard = document.createElement("div");
  howCard.className = "how-to-play-card";

  const howGrid = document.createElement("div");
  howGrid.className = "how-steps-grid";

  const steps = [
    { text: t("home.how1"), icon: createCodeIcon() },
    { text: t("home.how2"), icon: createFingerIcon() },
    { text: t("home.how3"), icon: createCheckIcon() }
  ];

  for (const step of steps) {
    const stepEl = document.createElement("div");
    stepEl.className = "how-step";

    const iconWrap = document.createElement("span");
    iconWrap.className = "how-icon";
    iconWrap.setAttribute("aria-hidden", "true");
    iconWrap.appendChild(step.icon);
    stepEl.appendChild(iconWrap);

    const textEl = document.createElement("span");
    textEl.textContent = step.text;
    stepEl.appendChild(textEl);

    howGrid.appendChild(stepEl);
  }

  howCard.appendChild(howGrid);
  contentCol.appendChild(howCard);

  // About these snippets (<details>)
  const about = document.createElement("details");
  about.className = "about-details";

  const aboutSummary = document.createElement("summary");
  aboutSummary.textContent = t("home.aboutTitle");
  about.appendChild(aboutSummary);

  const aboutBody = document.createElement("p");
  aboutBody.textContent = t("home.aboutBody");
  about.appendChild(aboutBody);

  contentCol.appendChild(about);

  // Free live session card (if enabled)
  if (CONFIG.session && CONFIG.session.enabled) {
    const sessionCard = document.createElement("div");
    sessionCard.className = "session-card";

    const sessionChip = document.createElement("span");
    sessionChip.className = "chip session-chip";
    sessionChip.textContent = t("session.label");
    sessionCard.appendChild(sessionChip);

    const sessionTitle = document.createElement("div");
    sessionTitle.className = "session-title";
    sessionTitle.textContent = CONFIG.session.title;
    sessionCard.appendChild(sessionTitle);

    if (CONFIG.session.when) {
      const sessionWhen = document.createElement("div");
      sessionWhen.className = "session-when";
      sessionWhen.textContent = CONFIG.session.when;
      sessionCard.appendChild(sessionWhen);
    }

    const sessionBtn = document.createElement("a");
    sessionBtn.className = "btn btn-outline session-btn";
    sessionBtn.href = CONFIG.session.url;
    sessionBtn.target = "_blank";
    sessionBtn.rel = "noopener noreferrer";
    sessionBtn.textContent = t("session.btn");
    sessionCard.appendChild(sessionBtn);

    contentCol.appendChild(sessionCard);
  }

  layout.appendChild(contentCol);

  // Hero editor wrapper (right column on desktop)
  const heroWrap = document.createElement("div");
  heroWrap.className = "hero-editor-wrap";
  layout.appendChild(heroWrap);

  currentRoot.appendChild(layout);

  // Start hero editor animation
  heroHandle = initHeroEditor(heroWrap);
}

/**
 * Leave the screen and clean up animations.
 */
export function leave() {
  if (heroHandle) {
    heroHandle.destroy();
    heroHandle = null;
  }
  if (ambientHandle) {
    ambientHandle.destroy();
    ambientHandle = null;
  }
  if (currentRoot) {
    while (currentRoot.firstChild) {
      currentRoot.removeChild(currentRoot.firstChild);
    }
  }
}

// Inline SVGs for How to play steps
function createCodeIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  const poly1 = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  poly1.setAttribute("points", "16 18 22 12 16 6");
  const poly2 = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  poly2.setAttribute("points", "8 6 2 12 8 18");
  svg.appendChild(poly1);
  svg.appendChild(poly2);
  return svg;
}

function createFingerIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", "12");
  circle.setAttribute("cy", "12");
  circle.setAttribute("r", "10");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "m12 8 4 4-4 4");
  svg.appendChild(circle);
  svg.appendChild(path);
  return svg;
}

function createCheckIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  const poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  poly.setAttribute("points", "20 6 9 17 4 12");
  svg.appendChild(poly);
  return svg;
}
