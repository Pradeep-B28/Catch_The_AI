// Fit check test suite measuring all 20 challenges against viewport constraints.
// Uses content.js, screens/play.js, and document measurement APIs.
// Used when ?preview=all is loaded in the browser.

import { getAllChallenges } from "./content.js";
import { mountPlayScreen } from "./screens/play.js";

/**
 * Executes the fit check across all 20 challenges and renders a report table.
 * @param {HTMLElement} container
 */
export async function runFitCheck(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const challenges = getAllChallenges();
  const results = [];

  const wrapper = document.createElement("div");
  wrapper.className = "fit-check-container";

  const heading = document.createElement("h2");
  heading.textContent = `Fit Check: All 20 Challenges (${window.innerWidth} x ${window.innerHeight})`;
  heading.style.fontSize = "1.25rem";
  heading.style.marginBottom = "0.5rem";
  wrapper.appendChild(heading);

  const desc = document.createElement("p");
  desc.textContent = "Verifying that top bar, task card, code card, and confirm button fit without horizontal overflow and without vertical page scroll.";
  desc.style.color = "var(--muted)";
  desc.style.fontSize = "0.875rem";
  desc.style.marginBottom = "1rem";
  wrapper.appendChild(desc);

  const testStage = document.createElement("div");
  testStage.style.width = "100%";
  testStage.style.visibility = "hidden";
  testStage.style.position = "absolute";
  testStage.style.top = "0";
  testStage.style.left = "0";
  testStage.style.pointerEvents = "none";
  document.body.appendChild(testStage);

  const headerHeight = document.querySelector(".site-header")?.offsetHeight ?? 56;
  const availableViewportHeight = window.innerHeight;

  for (const ch of challenges) {
    // Mount temporarily to measure real layout
    const playInstance = mountPlayScreen(testStage, {
      challenge: ch,
      currentIndex: 0,
      total: 8
    });

    // Force layout computation
    const playLayout = testStage.querySelector(".play-layout");
    const editorBody = testStage.querySelector(".code-editor-body");
    const codeCard = testStage.querySelector(".code-card");
    const confirmBtn = testStage.querySelector(".confirm-btn");

    const totalHeight = (playLayout?.offsetHeight ?? 0) + headerHeight;
    const computedFontSize = editorBody ? window.getComputedStyle(editorBody).fontSize : "15px";

    // Check horizontal overflow on all code lines
    let hasHorizontalOverflow = false;
    if (editorBody) {
      const lineTexts = editorBody.querySelectorAll(".code-line-text");
      for (const lt of lineTexts) {
        if (lt.scrollWidth > lt.clientWidth + 2) {
          hasHorizontalOverflow = true;
          break;
        }
      }
    }

    // Measure longest line
    let maxLen = 0;
    for (const l of ch.code) {
      if (l.length > maxLen) maxLen = l.length;
    }

    // Determine fit
    const fitsVertically = totalHeight <= availableViewportHeight;
    const passes = fitsVertically && !hasHorizontalOverflow;

    results.push({
      id: ch.id,
      title: ch.title,
      lines: ch.code.length,
      longest: maxLen,
      fontSize: computedFontSize,
      totalHeight,
      viewportHeight: availableViewportHeight,
      hasOverflow: hasHorizontalOverflow,
      pass: passes
    });

    playInstance.leave();
    while (testStage.firstChild) {
      testStage.removeChild(testStage.firstChild);
    }
  }

  document.body.removeChild(testStage);

  const allPass = results.every((r) => r.pass);

  const badge = document.createElement("div");
  badge.className = "chip";
  badge.style.fontSize = "0.875rem";
  badge.style.padding = "0.5rem 1rem";
  badge.style.marginBottom = "1rem";
  badge.style.backgroundColor = allPass ? "var(--brand-soft)" : "rgba(225, 29, 72, 0.15)";
  badge.style.color = allPass ? "var(--brand-strong)" : "var(--error)";
  badge.textContent = allPass
    ? `ALL 20 PASS: Fits screen cleanly at ${window.innerWidth}x${window.innerHeight}`
    : "FAILURES: Some challenges exceeded viewport";
  wrapper.appendChild(badge);

  const table = document.createElement("table");
  table.className = "fit-table";

  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  for (const h of ["ID", "Title", "Lines", "Longest", "Font Size", "Total H", "Screen H", "Result"]) {
    const th = document.createElement("th");
    th.textContent = h;
    trHead.appendChild(th);
  }
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const r of results) {
    const tr = document.createElement("tr");

    const tdId = document.createElement("td");
    tdId.textContent = r.id;
    tdId.style.fontWeight = "700";

    const tdTitle = document.createElement("td");
    tdTitle.textContent = r.title;

    const tdLines = document.createElement("td");
    tdLines.textContent = String(r.lines);

    const tdLong = document.createElement("td");
    tdLong.textContent = `${r.longest} ch`;

    const tdFont = document.createElement("td");
    tdFont.textContent = r.fontSize;

    const tdH = document.createElement("td");
    tdH.textContent = `${Math.round(r.totalHeight)}px`;

    const tdScreen = document.createElement("td");
    tdScreen.textContent = `${r.viewportHeight}px`;

    const tdRes = document.createElement("td");
    const resSpan = document.createElement("span");
    resSpan.className = "chip";
    resSpan.textContent = r.pass ? "PASS" : "FAIL";
    resSpan.style.backgroundColor = r.pass ? "var(--brand-soft)" : "rgba(225, 29, 72, 0.15)";
    resSpan.style.color = r.pass ? "var(--brand-strong)" : "var(--error)";
    tdRes.appendChild(resSpan);

    tr.appendChild(tdId);
    tr.appendChild(tdTitle);
    tr.appendChild(tdLines);
    tr.appendChild(tdLong);
    tr.appendChild(tdFont);
    tr.appendChild(tdH);
    tr.appendChild(tdScreen);
    tr.appendChild(tdRes);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  wrapper.appendChild(table);

  container.appendChild(wrapper);

  return results;
}
