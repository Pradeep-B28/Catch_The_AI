// Verification test suite executing checks a through n from Project Brief Section 10.
// Uses content, rng, game, timer, score, links, and copy modules.
// Used when ?test=1 is present in the URL, rendering results on screen and console.

import { CONFIG } from "../config.js";
import { PACKS } from "../content/index.js";
import { mulberry32, seededShuffle } from "./rng.js";
import { getPack, getChallenge, getAllChallenges, buildRound, dailySet } from "./content.js";
import { createTimer } from "./timer.js";
import { rank, resultLine, headToHeadLine, missedConcepts, averageCatchTime } from "./score.js";
import { challengeLink, readChallenge, salesUrl, shareText, shareWhatsAppUrl, isValidPhone } from "./links.js";
import { COPY, t } from "./copy.js";
import { createGame } from "./game.js";

/**
 * Runs all Section 10 tests and returns structured results.
 * @returns {Promise<{ version: string, allPass: boolean, results: Array<{ id: string, name: string, pass: boolean, detail: string }> }>}
 */
export async function runSelfTest() {
  const results = [];

  function assert(id, name, condition, detail = "") {
    results.push({
      id,
      name,
      pass: Boolean(condition),
      detail: condition ? (detail || "PASS") : (detail || "FAIL")
    });
  }

  // --- a. Content loading ---
  try {
    const packB = getPack("b");
    const packD = getPack("d");
    const activeB = packB ? packB.challenges.filter((c) => !c.retired) : [];
    const activeD = packD ? packD.challenges.filter((c) => !c.retired) : [];
    const totalActive = activeB.length + activeD.length;

    const all = getAllChallenges();
    const ids = all.map((c) => c.id);
    const uniqueIds = new Set(ids);

    let bugsValid = true;
    let notesValid = true;

    for (const c of all) {
      if (!c.code || c.bugLine < 1 || c.bugLine > c.code.length) {
        bugsValid = false;
      }
      if (c.notes) {
        if (!Array.isArray(c.notes) || c.notes.length !== c.code.length) {
          notesValid = false;
        }
      }
    }

    const aPass =
      activeB.length === 10 &&
      activeD.length === 10 &&
      totalActive === 20 &&
      uniqueIds.size === 20 &&
      bugsValid &&
      notesValid;

    assert(
      "a",
      "Content loading",
      aPass,
      `Packs b/d (10 each), 20 total active, all unique, bugLines and notes valid`
    );
  } catch (err) {
    assert("a", "Content loading", false, err.message);
  }

  // --- b. Rounds (200 rounds per pack) ---
  try {
    let bRoundsPass = true;
    let bErrorDetail = "";

    for (const packId of ["b", "d"]) {
      for (let i = 0; i < 200; i++) {
        const round = buildRound(packId);
        if (round.length !== 8) {
          bRoundsPass = false;
          bErrorDetail = `Round size was ${round.length}, expected 8`;
          break;
        }
        const ids = round.map((c) => c.id);
        if (new Set(ids).size !== 8) {
          bRoundsPass = false;
          bErrorDetail = "Non-unique challenges in round";
          break;
        }
        if (round.some((c) => c.retired)) {
          bRoundsPass = false;
          bErrorDetail = "Retired challenge included in active round";
          break;
        }
        if (round.some((c) => !c.id.startsWith(packId))) {
          bRoundsPass = false;
          bErrorDetail = `Challenge id not matching pack ${packId}`;
          break;
        }
        // Verify levels never decrease
        for (let j = 1; j < round.length; j++) {
          if (round[j].level < round[j - 1].level) {
            bRoundsPass = false;
            bErrorDetail = `Level decreased from ${round[j - 1].level} to ${round[j].level}`;
            break;
          }
        }
        if (!bRoundsPass) break;
      }
      if (!bRoundsPass) break;
    }

    // Test copy of pack b with b01 marked retired
    const packBOriginal = getPack("b");
    const packBRetiredCopy = {
      ...packBOriginal,
      challenges: packBOriginal.challenges.map((c) =>
        c.id === "b01" ? { ...c, retired: true } : { ...c }
      )
    };

    let b01Appeared = false;
    for (let i = 0; i < 200; i++) {
      const r = buildRound("b", Math.random, packBRetiredCopy);
      if (r.some((c) => c.id === "b01")) {
        b01Appeared = true;
        break;
      }
    }

    const customPacks = [packBRetiredCopy, getPack("d")];
    const linkWithRetired = readChallenge(
      "?set=b01.b02.b03.b04.b05.b06.b07.b08&beat=6",
      customPacks
    );
    const retiredLinkAccepted =
      linkWithRetired !== null && linkWithRetired.ids.includes("b01");

    const bPass = bRoundsPass && !b01Appeared && retiredLinkAccepted;
    assert(
      "b",
      "Rounds (200x per pack)",
      bPass,
      bPass
        ? "200 rounds per pack passed (size 8, sorted levels, retired b01 excluded but accepted in link)"
        : bErrorDetail || "Retired challenge test failed"
    );
  } catch (err) {
    assert("b", "Rounds", false, err.message);
  }

  // --- c. Ranks (out of 8 and 10) ---
  try {
    const ranks8Expected = {
      0: "Fresh Eyes",
      1: "Fresh Eyes",
      2: "Fresh Eyes",
      3: "Getting Sharp",
      4: "Getting Sharp",
      5: "Sharp Reviewer",
      6: "Sharp Reviewer",
      7: "Bug Hunter",
      8: "AI's Toughest Reviewer"
    };

    const ranks10Expected = {
      0: "Fresh Eyes",
      1: "Fresh Eyes",
      2: "Fresh Eyes",
      3: "Fresh Eyes",
      4: "Getting Sharp",
      5: "Getting Sharp",
      6: "Sharp Reviewer",
      7: "Sharp Reviewer",
      8: "Sharp Reviewer",
      9: "Bug Hunter",
      10: "AI's Toughest Reviewer"
    };

    let cPass = true;
    for (const [scoreStr, exp] of Object.entries(ranks8Expected)) {
      if (rank(Number(scoreStr), 8) !== exp) {
        cPass = false;
        break;
      }
    }
    for (const [scoreStr, exp] of Object.entries(ranks10Expected)) {
      if (rank(Number(scoreStr), 10) !== exp) {
        cPass = false;
        break;
      }
    }

    assert("c", "Ranks (out of 8 & 10)", cPass, "Percentages match all table thresholds");
  } catch (err) {
    assert("c", "Ranks", false, err.message);
  }

  // --- d. Result lines ---
  try {
    const dChecks = [
      resultLine(0, 8) === "AI wrote all 8. This time, every mistake got past you.",
      resultLine(1, 8) === "AI wrote all 8. You caught 1.",
      resultLine(6, 8) === "AI wrote all 8. You caught 6.",
      resultLine(8, 8) === "AI wrote all 8. You caught every one."
    ];
    const dPass = dChecks.every(Boolean);
    assert("d", "Result lines", dPass, "Exact match for 0, 1, 6, and 8 of 8");
  } catch (err) {
    assert("d", "Result lines", false, err.message);
  }

  // --- e. Head-to-head lines ---
  try {
    const eChecks = [
      headToHeadLine(7, 6) === "You caught 7. Your friend caught 6. You win this one.",
      headToHeadLine(6, 6) === "You both caught 6. It's a tie.",
      headToHeadLine(5, 6) === "Your friend caught 6. You caught 5. Rematch?"
    ];
    const ePass = eChecks.every(Boolean);
    assert("e", "Head-to-head lines", ePass, "Exact match for win, tie, and loss");
  } catch (err) {
    assert("e", "Head-to-head lines", false, err.message);
  }

  // --- f. Challenge links ---
  try {
    const origin = "https://catchtheai.vercel.app/";
    const ids = ["b01", "b02", "b03", "b04", "b05", "b06", "b07", "b08"];
    const genLink = challengeLink(origin, ids, 6);
    const linkMatch =
      genLink ===
      "https://catchtheai.vercel.app/?set=b01.b02.b03.b04.b05.b06.b07.b08&beat=6";

    const f1 = readChallenge("?set=b01.b02.b03.b04.b05.b06.b07.b08&beat=6");
    const f1Pass =
      f1 !== null &&
      f1.packId === "b" &&
      f1.ids.join(".") === "b01.b02.b03.b04.b05.b06.b07.b08" &&
      f1.beat === 6;

    const f2 = readChallenge("?set=d10.d01.d02.d03.d04.d05.d06.d07&beat=0");
    const f2Pass = f2 !== null && f2.packId === "d" && f2.beat === 0;

    const f3 = readChallenge("?set=b01.b02.b03.b04.b05.b06.b07.b08");
    const f3Pass = f3 !== null && f3.packId === "b" && f3.beat === null;

    const f4 = readChallenge("?set=b01.b02.b03&beat=2");
    const f4Pass = f4 !== null && f4.packId === "b" && f4.ids.length === 3 && f4.beat === 2;

    const f5 = readChallenge("?set=b01.b02&beat=1") === null;
    const f6 = readChallenge("?set=b01.b02.b03.b04.b05.b06.b07.d08&beat=3") === null;
    const f7 = readChallenge("?set=b01.b01.b03.b04.b05.b06.b07.b08&beat=3") === null;
    const f8 = readChallenge("?set=b01.b02.b03.b04.b05.b06.b07.x99&beat=3") === null;
    const f9 = readChallenge("?set=B01.B02.B03.B04.B05.B06.B07.B08&beat=3") === null;
    const f10 = readChallenge("?set=b01.b02.b03.b04.b05.b06.b07.b08&beat=9") === null;
    const f11 = readChallenge("?set=b01.b02.b03.b04.b05.b06.b07.b08&beat=abc") === null;
    const f12 = readChallenge("") === null;

    const fPass =
      linkMatch &&
      f1Pass &&
      f2Pass &&
      f3Pass &&
      f4Pass &&
      f5 &&
      f6 &&
      f7 &&
      f8 &&
      f9 &&
      f10 &&
      f11 &&
      f12;

    assert("f", "Challenge links", fPass, "Link builder and all 12 query scenarios matched");
  } catch (err) {
    assert("f", "Challenge links", false, err.message);
  }

  // --- g. WhatsApp sales link ---
  try {
    const testPhone = "910000000000";
    const expectedB =
      "https://wa.me/910000000000?text=Hi%2C%20I%20just%20played%20Catch%20the%20AI%20on%20Beginner%20mode%20and%20caught%206%20of%208%20mistakes.%20I'd%20like%20to%20know%20more%20about%20the%20Certification%20Program%20in%20AI-Powered%20Software%20Engineering%20%26%20DSA.";
    const expectedD =
      "https://wa.me/910000000000?text=Hi%2C%20I%20just%20played%20Catch%20the%20AI%20on%20Developer%20mode%20and%20caught%208%20of%208%20mistakes.%20I'd%20like%20to%20know%20more%20about%20the%20Certification%20Program%20in%20AI-Powered%20Software%20Engineering%20%26%20DSA.";

    const urlB = salesUrl(testPhone, "Beginner", 6, 8);
    const urlD = salesUrl(testPhone, "Developer", 8, 8);

    const configPhoneValid =
      !CONFIG.salesWhatsApp || isValidPhone(CONFIG.salesWhatsApp);

    const gPass = urlB === expectedB && urlD === expectedD && configPhoneValid;
    assert("g", "WhatsApp sales link", gPass, "Exact encoded URLs and phone validator pass");
  } catch (err) {
    assert("g", "WhatsApp sales link", false, err.message);
  }

  // --- h. Share text ---
  try {
    const testLink =
      "https://catchtheai.vercel.app/?set=b01.b02.b03.b04.b05.b06.b07.b08&beat=6";
    const expText6 =
      "AI wrote 8 pieces of code, each with a hidden mistake. I caught 6. Can you beat me? https://catchtheai.vercel.app/?set=b01.b02.b03.b04.b05.b06.b07.b08&beat=6";
    const expText8 =
      "AI wrote 8 pieces of code, each with a hidden mistake. I caught all 8. Can you match that? https://catchtheai.vercel.app/?set=b01.b02.b03.b04.b05.b06.b07.b08&beat=6";
    const expWaUrl =
      "https://wa.me/?text=AI%20wrote%208%20pieces%20of%20code%2C%20each%20with%20a%20hidden%20mistake.%20I%20caught%206.%20Can%20you%20beat%20me%3F%20https%3A%2F%2Fcatchtheai.vercel.app%2F%3Fset%3Db01.b02.b03.b04.b05.b06.b07.b08%26beat%3D6";

    const text6 = shareText(6, 8, testLink);
    const text8 = shareText(8, 8, testLink);
    const waUrl = shareWhatsAppUrl(text6);

    const hPass = text6 === expText6 && text8 === expText8 && waUrl === expWaUrl;
    assert("h", "Share text", hPass, "Normal, perfect score, and WhatsApp share URL verified");
  } catch (err) {
    assert("h", "Share text", false, err.message);
  }

  // --- i. Missed concepts ---
  try {
    // Round b01 to b08: caught = [yes, no, yes, no, yes, no, no, yes]
    const bChallenges = ["b01", "b02", "b03", "b04", "b05", "b06", "b07", "b08"].map(
      (id) => getChallenge(id)
    );
    const bPattern = [true, false, true, false, true, false, false, true];
    const bResults = bChallenges.map((c, idx) => ({
      id: c.id,
      challenge: c,
      result: bPattern[idx] ? "caught" : "wrong"
    }));

    const bConcepts = missedConcepts(bResults);
    const bConceptsExp = ["Using the right value", "Order of values", "Loop limits"];
    const bConceptsPass =
      JSON.stringify(bConcepts) === JSON.stringify(bConceptsExp);

    // Round d01 to d08, all missed: first 4 unique concepts
    const dChallenges = ["d01", "d02", "d03", "d04", "d05", "d06", "d07", "d08"].map(
      (id) => getChallenge(id)
    );
    const dResults = dChallenges.map((c) => ({
      id: c.id,
      challenge: c,
      result: "wrong"
    }));
    const dConcepts = missedConcepts(dResults);
    const dConceptsExp = [
      "Starting values",
      "Loop limits",
      "Made-up methods",
      "Two pointers"
    ];
    const dConceptsPass =
      JSON.stringify(dConcepts) === JSON.stringify(dConceptsExp);

    // Perfect round: empty
    const perfectResults = bChallenges.map((c) => ({
      id: c.id,
      challenge: c,
      result: "caught"
    }));
    const perfectPass = missedConcepts(perfectResults).length === 0;

    const iPass = bConceptsPass && dConceptsPass && perfectPass;
    assert("i", "Missed concepts", iPass, "Unique concepts in order capped at 4");
  } catch (err) {
    assert("i", "Missed concepts", false, err.message);
  }

  // --- j. Average catch time ---
  try {
    const avgPass = averageCatchTime([4.2, 9.9, 12.0]) === "8.7";
    const emptyPass = averageCatchTime([]) === null;
    assert("j", "Average catch time", avgPass && emptyPass, "[4.2, 9.9, 12.0] gives 8.7; empty gives null");
  } catch (err) {
    assert("j", "Average catch time", false, err.message);
  }

  // --- k. Timer (fake clock) ---
  try {
    let fakeTime = 0;
    const clock = () => fakeTime;
    const timer = createTimer({ totalSeconds: 30, clock });
    timer.start();

    const expectedPoints = [
      { t: 0, s: 30, warn: false, exp: false },
      { t: 0.001, s: 30, warn: false, exp: false },
      { t: 1.0, s: 29, warn: false, exp: false },
      { t: 24.999, s: 6, warn: false, exp: false },
      { t: 25.0, s: 5, warn: true, exp: false },
      { t: 29.999, s: 1, warn: true, exp: false },
      { t: 30.0, s: 0, warn: true, exp: true }
    ];

    let tablePass = true;
    for (const pt of expectedPoints) {
      fakeTime = pt.t;
      const st = timer.getStatus();
      if (
        st.secondsShown !== pt.s ||
        st.isWarning !== pt.warn ||
        st.isExpired !== pt.exp
      ) {
        tablePass = false;
        break;
      }
    }

    // Pause test: start 0, pause at 10, resume at 15
    const pTimer = createTimer({ totalSeconds: 30, clock });
    fakeTime = 0;
    pTimer.start();
    fakeTime = 10;
    pTimer.pause();
    fakeTime = 15;
    pTimer.resume();

    fakeTime = 34.999;
    const st34 = pTimer.getStatus();
    const pause34Pass = st34.secondsShown === 1 && !st34.isExpired;

    fakeTime = 35.0;
    const st35 = pTimer.getStatus();
    const pause35Pass = st35.secondsShown === 0 && st35.isExpired;

    // Lock at 20 with 10..15 pause: records 15.0s
    fakeTime = 20;
    const st20 = pTimer.getStatus();
    const lock20Pass = st20.recordedSeconds === 15.0;

    // Lock at 12.34 without pause: records 12.3s
    const nTimer = createTimer({ totalSeconds: 30, clock });
    fakeTime = 0;
    nTimer.start();
    fakeTime = 12.34;
    const st12 = nTimer.getStatus();
    const lock12Pass = st12.recordedSeconds === 12.3;

    const kPass = tablePass && pause34Pass && pause35Pass && lock20Pass && lock12Pass;
    assert("k", "Timer (fake clock & pause)", kPass, "Exact match across table, pause, and locking");
  } catch (err) {
    assert("k", "Timer", false, err.message);
  }

  // --- l. Seeded random ---
  try {
    const rng = mulberry32(42);
    const v1 = rng().toFixed(10);
    const v2 = rng().toFixed(10);
    const v3 = rng().toFixed(10);
    const rngPass =
      v1 === "0.6011037519" && v2 === "0.4482905590" && v3 === "0.8524657935";

    const d1 = dailySet("b", 20261027).join(", ");
    const d2 = dailySet("d", 20261027).join(", ");
    const d3 = dailySet("b", 20261028).join(", ");

    const d1Pass = d1 === "b03, b01, b04, b02, b09, b06, b07, b10";
    const d2Pass = d2 === "d03, d01, d07, d04, d02, d09, d06, d10";
    const d3Pass = d3 === "b05, b03, b02, b04, b09, b06, b07, b10";

    const lPass = rngPass && d1Pass && d2Pass && d3Pass;
    assert(
      "l",
      "Seeded random (mulberry32 & dailySet)",
      lPass,
      "mulberry32 and dailySets match all test vectors"
    );
  } catch (err) {
    assert("l", "Seeded random", false, err.message);
  }

  // --- m. Words ---
  try {
    const banned = [
      "stupid",
      "dumb",
      "idiot",
      "noob",
      "loser",
      "take your job",
      "replace you",
      "guarantee",
      "placement",
      "salary",
      "seats left"
    ];
    // Check all values in COPY
    let bannedFound = false;
    let emojiFound = false;
    let emDashFound = false;

    // Emoji regex checking emoji ranges
    const emojiRegex =
      /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;

    for (const val of Object.values(COPY)) {
      const lower = String(val).toLowerCase();
      for (const b of banned) {
        if (lower.includes(b)) {
          bannedFound = true;
          break;
        }
      }
      if (val.includes("—")) {
        emDashFound = true;
      }
      if (emojiRegex.test(val)) {
        emojiFound = true;
      }
    }

    const ctaText = t("cta.body");
    const salesMsg = salesUrl("910000000000", "Beginner", 6, 8);
    const courseNamePresent =
      ctaText.includes(CONFIG.courseName) &&
      salesMsg.includes(encodeURIComponent(CONFIG.courseName));

    const mPass =
      !bannedFound && !emojiFound && !emDashFound && courseNamePresent;
    assert(
      "m",
      "Words & tone compliance",
      mPass,
      "No banned words, emojis, or em dashes; full course name used"
    );
  } catch (err) {
    assert("m", "Words", false, err.message);
  }

  // --- n. Privacy and storage ---
  try {
    // Verify storage keys in browser environment
    let nPass = true;
    let storageDetail = "No unexpected keys";

    if (typeof window !== "undefined" && window.localStorage) {
      // Simulate playing a round
      const game = createGame();
      const round = buildRound("b");
      game.startRound("b", round);
      for (let i = 0; i < round.length; i++) {
        game.finishTyping();
        game.selectLine(round[i].bugLine);
        game.lockAnswer(5);
        if (i < round.length - 1) {
          game.nextSnippet();
        }
      }

      // Check current localStorage keys
      const allowedKeys = new Set(["cta-theme", "cta-muted", "cta-best"]);
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!allowedKeys.has(key)) {
          nPass = false;
          storageDetail = `Unexpected key in localStorage: ${key}`;
          break;
        }
      }
    }

    assert("n", "Privacy & localStorage keys", nPass, storageDetail);
  } catch (err) {
    assert("n", "Privacy & storage", false, err.message);
  }

  const allPass = results.every((r) => r.pass);
  return {
    version: CONFIG.version,
    allPass,
    results
  };
}

/**
 * Renders the test results table into the DOM and console.
 * @param {HTMLElement} container
 * @param {object} testData
 */
export function renderTestReport(container, testData) {
  if (!container) return;
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const wrap = document.createElement("div");
  wrap.style.maxWidth = "900px";
  wrap.style.margin = "1.5rem auto";
  wrap.style.padding = "1.5rem";
  wrap.style.backgroundColor = "var(--surface)";
  wrap.style.borderRadius = "var(--radius-card)";
  wrap.style.border = "1px solid var(--border)";
  wrap.style.boxShadow = "var(--shadow-md)";

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.justifyContent = "space-between";
  header.style.marginBottom = "1rem";
  header.style.paddingBottom = "0.75rem";
  header.style.borderBottom = "1px solid var(--border)";

  const title = document.createElement("h2");
  title.textContent = `Self-Test Suite v${testData.version}`;
  title.style.fontSize = "1.25rem";
  title.style.margin = "0";

  const statusBadge = document.createElement("span");
  statusBadge.className = "chip";
  statusBadge.textContent = testData.allPass ? "ALL PASS" : "FAILURES DETECTED";
  statusBadge.style.backgroundColor = testData.allPass ? "var(--brand-soft)" : "rgba(225, 29, 72, 0.15)";
  statusBadge.style.color = testData.allPass ? "var(--brand-strong)" : "var(--error)";
  statusBadge.style.fontSize = "0.875rem";
  statusBadge.style.padding = "0.35rem 0.75rem";

  header.appendChild(title);
  header.appendChild(statusBadge);
  wrap.appendChild(header);

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.fontSize = "0.875rem";

  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  for (const col of ["ID", "Check", "Result", "Details"]) {
    const th = document.createElement("th");
    th.textContent = col;
    th.style.textAlign = "left";
    th.style.padding = "0.5rem 0.75rem";
    th.style.borderBottom = "2px solid var(--border)";
    th.style.color = "var(--muted)";
    trHead.appendChild(th);
  }
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const row of testData.results) {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--border)";

    const tdId = document.createElement("td");
    tdId.textContent = row.id;
    tdId.style.fontWeight = "700";
    tdId.style.padding = "0.625rem 0.75rem";

    const tdName = document.createElement("td");
    tdName.textContent = row.name;
    tdName.style.padding = "0.625rem 0.75rem";

    const tdStatus = document.createElement("td");
    const statusSpan = document.createElement("span");
    statusSpan.className = "chip";
    statusSpan.textContent = row.pass ? "PASS" : "FAIL";
    statusSpan.style.backgroundColor = row.pass ? "var(--brand-soft)" : "rgba(225, 29, 72, 0.15)";
    statusSpan.style.color = row.pass ? "var(--brand-strong)" : "var(--error)";
    tdStatus.appendChild(statusSpan);
    tdStatus.style.padding = "0.625rem 0.75rem";

    const tdDetail = document.createElement("td");
    tdDetail.textContent = row.detail;
    tdDetail.style.color = "var(--muted)";
    tdDetail.style.padding = "0.625rem 0.75rem";

    tr.appendChild(tdId);
    tr.appendChild(tdName);
    tr.appendChild(tdStatus);
    tr.appendChild(tdDetail);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  wrap.appendChild(table);

  container.appendChild(wrap);
}
