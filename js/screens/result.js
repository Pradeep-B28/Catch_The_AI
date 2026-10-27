// Result screen view presenting score count-up, tally dots, rank badge, and WhatsApp CTA.
// Uses score.js, links.js, copy.js, fx/sound.js, content.js, and events.js.
// Used by router after an 8-snippet round concludes.

import { CONFIG } from "../../config.js";
import { t } from "../copy.js";
import { rank, resultLine, headToHeadLine, missedConcepts, averageCatchTime } from "../score.js";
import { salesUrl, websiteUrl } from "../links.js";
import { getPack } from "../content.js";
import { playResultFanfare } from "../fx/sound.js";
import { emit } from "../events.js";

let currentRoot = null;
let navigateFn = null;
let countRafId = null;

/**
 * Standard screen mount.
 * @param {HTMLElement} root
 * @param {Function} navigate
 */
export function mount(root, navigate) {
  currentRoot = root;
  navigateFn = navigate;
}

/**
 * Standard screen enter.
 * @param {object} params
 * @param {string} [params.packId="b"]
 * @param {number} [params.total=8]
 * @param {Array} [params.results=[]]
 * @param {number} [params.beat]
 */
export function enter(params = {}) {
  if (!currentRoot) return;

  while (currentRoot.firstChild) {
    currentRoot.removeChild(currentRoot.firstChild);
  }

  const {
    packId = "b",
    total = CONFIG.roundSize ?? 8,
    results = [],
    beat = null
  } = params;

  const score = results.filter((r) => r.result === "caught").length;
  const isPerfect = score === total;
  const pack = getPack(packId);
  const packName = pack ? pack.name : "Beginner";

  // Check and save best score (Rule 4: cta-best only)
  let isNewBest = false;
  try {
    const rawBest = window.localStorage ? window.localStorage.getItem("cta-best") : null;
    const bestObj = rawBest ? JSON.parse(rawBest) : {};
    const prevBest = bestObj[packId];
    if (typeof prevBest !== "number" || score > prevBest) {
      bestObj[packId] = score;
      if (window.localStorage) {
        window.localStorage.setItem("cta-best", JSON.stringify(bestObj));
      }
      isNewBest = true;
    }
  } catch {}

  const layout = document.createElement("div");
  layout.className = "result-layout";

  // --- Hero Score Card ---
  const heroCard = document.createElement("div");
  heroCard.className = "result-card-hero";

  if (isNewBest) {
    const newBestChip = document.createElement("span");
    newBestChip.className = "chip chip-success";
    newBestChip.textContent = t("result.newBest");
    heroCard.appendChild(newBestChip);
  }

  const scoreTitle = document.createElement("div");
  scoreTitle.className = "result-score-title";
  scoreTitle.textContent = t("result.youCaught");
  heroCard.appendChild(scoreTitle);

  // Large score number counting up over 0.8s
  const scoreNumEl = document.createElement("div");
  scoreNumEl.className = "result-score-number tabular-nums";
  scoreNumEl.textContent = "0";
  heroCard.appendChild(scoreNumEl);

  const ofTotalEl = document.createElement("div");
  ofTotalEl.className = "result-score-title";
  ofTotalEl.textContent = t("result.of", { total });
  heroCard.appendChild(ofTotalEl);

  // Tally Dots (8 dots, 80ms apart)
  const tallyDots = document.createElement("div");
  tallyDots.className = "result-tally-dots";
  for (let i = 0; i < total; i++) {
    const dot = document.createElement("div");
    dot.className = "result-tally-dot";
    const res = results[i];
    const isCaught = res && res.result === "caught";
    dot.classList.add(isCaught ? "caught" : "missed");
    dot.style.animationDelay = `${i * 80}ms`;
    if (res && res.challenge && res.challenge.title) {
      dot.setAttribute("title", res.challenge.title);
    }
    tallyDots.appendChild(dot);
  }
  heroCard.appendChild(tallyDots);

  // Rank Badge (lands like stamp)
  const rankBadge = document.createElement("div");
  rankBadge.className = "result-rank-badge stamp-badge";
  rankBadge.textContent = rank(score, total);
  heroCard.appendChild(rankBadge);

  // Primary Result Line
  const lineP = document.createElement("p");
  lineP.className = "result-line-text";
  lineP.textContent = resultLine(score, total);
  heroCard.appendChild(lineP);

  // Support Copy
  const supportP = document.createElement("p");
  supportP.className = "result-support-text";
  supportP.textContent = t("result.support");
  heroCard.appendChild(supportP);

  // Average Catch Time (hidden if 0 caught)
  if (score > 0) {
    const avgSec = averageCatchTime(results);
    const avgEl = document.createElement("div");
    avgEl.className = "result-avg-text";
    avgEl.textContent = t("result.avg", { seconds: avgSec });
    heroCard.appendChild(avgEl);
  }

  // Head-to-Head Line (if from challenge link with beat)
  if (typeof beat === "number") {
    const h2hEl = document.createElement("div");
    h2hEl.className = "result-h2h-line";
    h2hEl.textContent = headToHeadLine(score, beat);
    heroCard.appendChild(h2hEl);
  }

  layout.appendChild(heroCard);

  // --- What Tripped You Up (Unique concepts, hidden on perfect score) ---
  if (!isPerfect) {
    const concepts = missedConcepts(results);
    if (concepts.length > 0) {
      const trippedCard = document.createElement("div");
      trippedCard.className = "tripped-card";

      const trippedTitle = document.createElement("div");
      trippedTitle.className = "tripped-title";
      trippedTitle.textContent = t("result.tripped");
      trippedCard.appendChild(trippedTitle);

      const chipsWrap = document.createElement("div");
      chipsWrap.className = "tripped-chips";
      for (const concept of concepts) {
        const chip = document.createElement("span");
        chip.className = "tripped-chip";
        chip.textContent = concept;
        chipsWrap.appendChild(chip);
      }
      trippedCard.appendChild(chipsWrap);
      layout.appendChild(trippedCard);
    }
  }

  // --- See all 8 again (<details>) ---
  const reviewDetails = document.createElement("details");
  reviewDetails.className = "review-details";

  const reviewSummary = document.createElement("summary");
  reviewSummary.textContent = t("result.review", { total });
  reviewDetails.appendChild(reviewSummary);

  const reviewList = document.createElement("div");
  reviewList.className = "review-list";
  for (const outcome of results) {
    const item = document.createElement("div");
    item.className = "review-item";

    const itemHeader = document.createElement("div");
    itemHeader.className = "review-item-header";

    const titleEl = document.createElement("span");
    titleEl.className = "review-item-title";
    titleEl.textContent = outcome.challenge?.title || outcome.id;
    itemHeader.appendChild(titleEl);

    const statusChip = document.createElement("span");
    statusChip.className = `chip ${outcome.result === "caught" ? "chip-success" : "chip-error"}`;
    statusChip.textContent = outcome.result === "caught" ? "Caught" : "Missed";
    itemHeader.appendChild(statusChip);

    item.appendChild(itemHeader);

    const whyEl = document.createElement("div");
    whyEl.className = "review-item-why";
    whyEl.textContent = outcome.challenge?.why || "";
    item.appendChild(whyEl);

    reviewList.appendChild(item);
  }
  reviewDetails.appendChild(reviewList);
  layout.appendChild(reviewDetails);

  // --- CTA Card (Section 6F) ---
  const ctaCard = document.createElement("div");
  ctaCard.className = "cta-card";

  const ctaTitle = document.createElement("h3");
  ctaTitle.className = "cta-title";
  ctaTitle.textContent = t("cta.title");
  ctaCard.appendChild(ctaTitle);

  const ctaBody = document.createElement("p");
  ctaBody.className = "cta-body";
  ctaBody.textContent = t("cta.body", { course: CONFIG.courseName });
  ctaCard.appendChild(ctaBody);

  const ctaButtons = document.createElement("div");
  ctaButtons.className = "cta-buttons";

  const isWhatsAppValid =
    typeof CONFIG.salesWhatsApp === "string" &&
    /^\d{11,15}$/.test(CONFIG.salesWhatsApp);

  if (isWhatsAppValid) {
    const waBtn = document.createElement("a");
    waBtn.className = "btn btn-primary cta-whatsapp-btn";
    waBtn.href = salesUrl({ packName, score, total });
    waBtn.target = "_blank";
    waBtn.rel = "noopener noreferrer";
    waBtn.textContent = t("cta.whatsapp");
    ctaButtons.appendChild(waBtn);
  } else {
    const progBtn = document.createElement("a");
    progBtn.className = "btn btn-primary cta-program-btn";
    progBtn.href = websiteUrl("result");
    progBtn.target = "_blank";
    progBtn.rel = "noopener noreferrer";
    progBtn.textContent = t("cta.program");
    ctaButtons.appendChild(progBtn);
  }

  const websiteLink = document.createElement("a");
  websiteLink.className = "cta-website-link";
  websiteLink.href = websiteUrl("result");
  websiteLink.target = "_blank";
  websiteLink.rel = "noopener noreferrer";
  websiteLink.textContent = t("cta.website");
  ctaButtons.appendChild(websiteLink);

  ctaCard.appendChild(ctaButtons);
  layout.appendChild(ctaCard);

  // --- Free Live Session Card (if enabled) ---
  if (CONFIG.session && CONFIG.session.enabled) {
    const sessionCard = document.createElement("div");
    sessionCard.className = "session-card";

    const sessionChip = document.createElement("span");
    sessionChip.className = "chip session-chip";
    sessionChip.textContent = t("session.label");
    sessionCard.appendChild(sessionChip);

    const sTitle = document.createElement("div");
    sTitle.className = "session-title";
    sTitle.textContent = CONFIG.session.title;
    sessionCard.appendChild(sTitle);

    if (CONFIG.session.when) {
      const sWhen = document.createElement("div");
      sWhen.className = "session-when";
      sWhen.textContent = CONFIG.session.when;
      sessionCard.appendChild(sWhen);
    }

    const sBtn = document.createElement("a");
    sBtn.className = "btn btn-outline session-btn";
    sBtn.href = CONFIG.session.url;
    sBtn.target = "_blank";
    sBtn.rel = "noopener noreferrer";
    sBtn.textContent = t("session.btn");
    sessionCard.appendChild(sBtn);

    layout.appendChild(sessionCard);
  }

  // --- Action Buttons ---
  const actionGrid = document.createElement("div");
  actionGrid.className = "result-action-buttons";

  const playAgainBtn = document.createElement("button");
  playAgainBtn.type = "button";
  playAgainBtn.className = "btn btn-primary";
  playAgainBtn.textContent = t("result.again");
  playAgainBtn.addEventListener("click", () => {
    if (navigateFn) {
      navigateFn("play", { packId });
    }
  });
  actionGrid.appendChild(playAgainBtn);

  const otherPack = packId === "b" ? "d" : "b";
  const otherPackObj = getPack(otherPack);
  const otherName = otherPackObj ? otherPackObj.name : (otherPack === "b" ? "Beginner" : "Developer");

  const switchModeBtn = document.createElement("button");
  switchModeBtn.type = "button";
  switchModeBtn.className = "btn btn-outline";
  switchModeBtn.textContent = t("result.switch", { mode: otherName });
  switchModeBtn.addEventListener("click", () => {
    if (navigateFn) {
      navigateFn("play", { packId: otherPack });
    }
  });
  actionGrid.appendChild(switchModeBtn);

  layout.appendChild(actionGrid);

  currentRoot.appendChild(layout);

  // Play fanfare sound
  playResultFanfare(isPerfect);

  // Score Count-Up Animation (over 800ms)
  const startTime = performance.now();
  const duration = 800;

  function countUp(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const currentScore = Math.floor(progress * score);
    scoreNumEl.textContent = String(currentScore);

    if (progress < 1) {
      countRafId = requestAnimationFrame(countUp);
    } else {
      scoreNumEl.textContent = String(score);
    }
  }

  countRafId = requestAnimationFrame(countUp);
}

/**
 * Standard screen leave.
 */
export function leave() {
  if (countRafId) {
    cancelAnimationFrame(countRafId);
    countRafId = null;
  }
  if (currentRoot) {
    while (currentRoot.firstChild) {
      currentRoot.removeChild(currentRoot.firstChild);
    }
  }
}
