// Play screen controller managing code card rendering, auto-fit, line picking, reveal, and round progression.
// Uses highlight.js, timer.js, fx/typing.js, fx/sound.js, fx/stamp.js, copy.js, content.js, and events.js.
// Used by router to execute active rounds and preview modes.

import { CONFIG } from "../../config.js";
import { t } from "../copy.js";
import { highlightLine } from "../highlight.js";
import { createTimer } from "../timer.js";
import { startTyping } from "../fx/typing.js";
import { playKeyTick, playTimerTick, playCatchSound, playMissSound, toggleMute } from "../fx/sound.js";
import { createStamp } from "../fx/stamp.js";
import { buildRound, getChallenge } from "../content.js";
import { emit } from "../events.js";

let currentRoot = null;
let navigateFn = null;
let activePlayInstance = null;

/**
 * Measure the optimal monospace font size (11px to 15px/16px) so lines fit without wrapping.
 * @param {string[]} lines Candidate code lines including fix
 * @param {number} availableWidth Width available for code text
 * @param {boolean} isLaptop
 * @returns {number}
 */
export function calculateAutoFit(lines, availableWidth, isLaptop) {
  const maxFont = isLaptop ? 16 : 15;
  const minFont = 11;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const monoFont = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

  let longestLine = "";
  for (const line of lines) {
    if (line.length > longestLine.length) {
      longestLine = line;
    }
  }

  for (let size = maxFont; size >= minFont; size--) {
    ctx.font = `${size}px ${monoFont}`;
    const measured = ctx.measureText(longestLine).width;
    if (measured <= availableWidth) {
      return size;
    }
  }

  return minFont;
}

/**
 * Extracts a display filename from the snippet code (e.g. "finalPrice.js").
 * @param {string[]} codeLines
 * @returns {string}
 */
export function extractFilename(codeLines) {
  if (!codeLines || codeLines.length === 0) return "ai-snippet.js";
  const match = codeLines[0].match(/function\s+([a-zA-Z0-9_$]+)/);
  if (match && match[1]) {
    return `${match[1]}.js`;
  }
  return "ai-snippet.js";
}

/**
 * Mount and run the Play Screen UI for a challenge.
 * @param {HTMLElement} root Container element
 * @param {object} options
 * @param {object} options.challenge Challenge object
 * @param {number} [options.currentIndex=0] 0-based index
 * @param {number} [options.total=8]
 * @param {Array<string>} [options.pastResults=[]] 'caught' | 'wrong' | 'timeout'
 * @param {(outcome: object) => void} [options.onAnswer]
 * @param {(outcome: object) => void} [options.onNext]
 * @returns {{ leave: () => void, setLine: (num: number) => void, confirm: () => void, triggerReveal: (outcome: object) => void }}
 */
export function mountPlayScreen(root, options) {
  const {
    challenge,
    currentIndex = 0,
    total = CONFIG.roundSize ?? 8,
    pastResults = [],
    onAnswer = () => {},
    onNext = () => {}
  } = options;

  let selectedLine = null;
  let isTyping = true;
  let isLocked = false;
  let isRevealed = false;
  let typingHandle = null;
  let timer = null;
  let rafTimerId = null;
  let lastTickedSecond = null;
  let showNotes = challenge.id.startsWith("b");

  while (root.firstChild) {
    root.removeChild(root.firstChild);
  }

  const layout = document.createElement("div");
  layout.className = "play-layout";

  // Top Bar (Counter, Progress Dots, Timer Ring)
  const topbar = document.createElement("div");
  topbar.className = "play-topbar";

  const topbarLeft = document.createElement("div");
  topbarLeft.className = "topbar-left";

  const counter = document.createElement("span");
  counter.className = "topbar-counter";
  counter.textContent = t("play.counter", { n: currentIndex + 1, total });
  topbarLeft.appendChild(counter);

  const dotsContainer = document.createElement("div");
  dotsContainer.className = "progress-dots";
  const dotsList = [];
  for (let i = 0; i < total; i++) {
    const dot = document.createElement("div");
    dot.className = "progress-dot";
    if (i < pastResults.length) {
      dot.classList.add(pastResults[i] === "caught" ? "caught" : "missed");
    } else if (i === currentIndex) {
      dot.classList.add("active");
    }
    dotsContainer.appendChild(dot);
    dotsList.push(dot);
  }
  topbarLeft.appendChild(dotsContainer);
  topbar.appendChild(topbarLeft);

  // SVG Timer Ring (56px)
  const timerContainer = document.createElement("div");
  timerContainer.className = "timer-container";
  const timerSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  timerSvg.setAttribute("class", "timer-svg");
  timerSvg.setAttribute("viewBox", "0 0 56 56");

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  grad.setAttribute("id", "timer-grad");
  grad.setAttribute("x1", "0%");
  grad.setAttribute("y1", "0%");
  grad.setAttribute("x2", "100%");
  grad.setAttribute("y2", "100%");

  const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "#059669");
  const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "#06B6D4");

  grad.appendChild(stop1);
  grad.appendChild(stop2);
  defs.appendChild(grad);
  timerSvg.appendChild(defs);

  const r = 24;
  const circ = 2 * Math.PI * r;

  const track = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  track.setAttribute("class", "timer-track");
  track.setAttribute("cx", "28");
  track.setAttribute("cy", "28");
  track.setAttribute("r", String(r));
  track.setAttribute("fill", "none");
  track.setAttribute("stroke-width", "4");

  const progressCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  progressCircle.setAttribute("class", "timer-progress");
  progressCircle.setAttribute("cx", "28");
  progressCircle.setAttribute("cy", "28");
  progressCircle.setAttribute("r", String(r));
  progressCircle.setAttribute("fill", "none");
  progressCircle.setAttribute("stroke-width", "4");
  progressCircle.setAttribute("stroke", "url(#timer-grad)");
  progressCircle.setAttribute("stroke-linecap", "round");
  progressCircle.setAttribute("stroke-dasharray", String(circ));
  progressCircle.setAttribute("stroke-dashoffset", "0");

  timerSvg.appendChild(track);
  timerSvg.appendChild(progressCircle);

  const timerText = document.createElement("div");
  timerText.className = "timer-text tabular-nums";
  timerText.textContent = String(CONFIG.secondsPerSnippet ?? 30);

  timerContainer.appendChild(timerSvg);
  timerContainer.appendChild(timerText);
  topbar.appendChild(timerContainer);

  // Task Card
  const taskCard = document.createElement("div");
  taskCard.className = "task-card";
  const taskLabel = document.createElement("span");
  taskLabel.className = "task-label";
  taskLabel.textContent = t("play.taskLabel");
  const taskText = document.createElement("p");
  taskText.className = "task-text";
  taskText.textContent = challenge.task;
  taskCard.appendChild(taskLabel);
  taskCard.appendChild(taskText);

  // Code Card
  const codeCard = document.createElement("div");
  codeCard.className = "code-card";

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
  const filename = document.createElement("span");
  filename.className = "editor-filename";
  filename.textContent = extractFilename(challenge.code);
  titleLeft.appendChild(dots);
  titleLeft.appendChild(filename);

  const titleRight = document.createElement("div");
  titleRight.className = "titlebar-right";

  const aiChip = document.createElement("span");
  aiChip.className = "ai-chip";
  aiChip.textContent = t("play.aiChip");
  titleRight.appendChild(aiChip);

  if (challenge.notes && CONFIG.features.lineNotes) {
    const notesBtn = document.createElement("button");
    notesBtn.type = "button";
    notesBtn.className = "notes-toggle-btn";
    notesBtn.textContent = showNotes ? t("play.notesOn") : t("play.notesOff");
    notesBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showNotes = !showNotes;
      notesBtn.textContent = showNotes ? t("play.notesOn") : t("play.notesOff");
      renderLines();
      recalculateFit();
    });
    titleRight.appendChild(notesBtn);
  }

  titlebar.appendChild(titleLeft);
  titlebar.appendChild(titleRight);
  codeCard.appendChild(titlebar);

  // Status banner
  const statusBanner = document.createElement("div");
  statusBanner.className = "code-status-banner";
  const bannerText = document.createElement("span");
  bannerText.className = "typing-shimmer";
  bannerText.textContent = t("play.writing");
  statusBanner.appendChild(bannerText);
  codeCard.appendChild(statusBanner);

  // Editor Body (Radiogroup)
  const editorBody = document.createElement("div");
  editorBody.className = "code-editor-body";
  editorBody.setAttribute("role", "radiogroup");
  editorBody.setAttribute("aria-label", t("play.linesLabel"));
  codeCard.appendChild(editorBody);

  // Confirm Button
  const confirmWrap = document.createElement("div");
  confirmWrap.className = "confirm-btn-wrap";
  const confirmBtn = document.createElement("button");
  confirmBtn.type = "button";
  confirmBtn.className = "btn btn-primary confirm-btn";
  confirmBtn.disabled = true;
  confirmBtn.textContent = t("play.pick");
  confirmWrap.appendChild(confirmBtn);

  // Reveal Panel placeholder
  let revealPanel = null;

  // Render line rows
  const lineRows = [];
  function renderLines(partiallyTyped = null, activeLine = -1) {
    while (editorBody.firstChild) {
      editorBody.removeChild(editorBody.firstChild);
    }
    lineRows.length = 0;

    const sourceLines = partiallyTyped ?? challenge.code;

    sourceLines.forEach((text, idx) => {
      const lineNum = idx + 1;
      const row = document.createElement("div");
      row.className = "code-line-row";
      if (showNotes && challenge.notes) row.classList.add("has-notes");
      if (selectedLine === lineNum) row.classList.add("selected");
      row.setAttribute("role", "radio");
      row.setAttribute("aria-checked", selectedLine === lineNum ? "true" : "false");
      row.setAttribute("tabindex", isTyping || isLocked ? "-1" : "0");
      row.setAttribute("data-line", String(lineNum));

      const gutter = document.createElement("span");
      gutter.className = "code-line-gutter";
      gutter.textContent = String(lineNum);
      row.appendChild(gutter);

      const content = document.createElement("div");
      content.className = "code-line-content";

      const lineTextWrap = document.createElement("div");
      lineTextWrap.className = "code-line-text";
      lineTextWrap.appendChild(highlightLine(text));

      if (isTyping && idx === activeLine) {
        const cursor = document.createElement("span");
        cursor.className = "code-cursor";
        cursor.setAttribute("aria-hidden", "true");
        lineTextWrap.appendChild(cursor);
      }

      content.appendChild(lineTextWrap);

      if (showNotes && challenge.notes && challenge.notes[idx]) {
        const note = document.createElement("div");
        note.className = "code-line-note";
        note.textContent = challenge.notes[idx];
        content.appendChild(note);
      }

      row.appendChild(content);

      row.addEventListener("click", () => {
        if (isTyping || isLocked) return;
        selectLineNumber(lineNum);
      });

      lineRows.push(row);
      editorBody.appendChild(row);
    });
  }

  function selectLineNumber(num) {
    if (isLocked) return;
    selectedLine = num;
    lineRows.forEach((row, idx) => {
      const lineNum = idx + 1;
      const isSel = lineNum === num;
      row.classList.toggle("selected", isSel);
      row.setAttribute("aria-checked", isSel ? "true" : "false");
    });
    confirmBtn.disabled = false;
    confirmBtn.textContent = t("play.confirm", { line: num });
  }

  function recalculateFit() {
    const isLaptop = window.innerWidth >= 900;
    const cardWidth = codeCard.clientWidth || (isLaptop ? 600 : Math.min(360, window.innerWidth - 32));
    const gutterWidth = 46;
    const padding = 24;
    const available = Math.max(160, cardWidth - gutterWidth - padding);

    const candidates = [...challenge.code, challenge.fix];
    const pickedSize = calculateAutoFit(candidates, available, isLaptop);
    editorBody.style.fontSize = `${pickedSize}px`;
  }

  codeCard.addEventListener("click", () => {
    if (isTyping && typingHandle) {
      typingHandle.finishImmediately();
    }
  });

  function handleConfirm() {
    if (isTyping || isLocked || selectedLine === null) return;
    isLocked = true;
    const timerStatus = timer ? timer.getStatus() : { recordedSeconds: 0 };
    if (timer) timer.stop();
    if (rafTimerId) cancelAnimationFrame(rafTimerId);

    const isCaught = selectedLine === challenge.bugLine;
    const outcome = {
      id: challenge.id,
      index: currentIndex,
      pickedLine: selectedLine,
      result: isCaught ? "caught" : "wrong",
      seconds: timerStatus.recordedSeconds,
      challenge
    };

    emit("snippet:answered", outcome);
    onAnswer(outcome);
    triggerReveal(outcome);
  }

  confirmBtn.addEventListener("click", handleConfirm);

  // The Reveal Experience (Section 6D)
  function triggerReveal(outcome) {
    if (typingHandle) {
      typingHandle.cancel();
      typingHandle = null;
    }
    isTyping = false;
    isRevealed = true;
    isLocked = true;
    confirmBtn.disabled = true;
    if (timer) timer.stop();
    if (rafTimerId) cancelAnimationFrame(rafTimerId);
    renderLines();

    // 1. Audio and Progress Dot
    const currentDot = dotsList[currentIndex];
    if (outcome.result === "caught") {
      playCatchSound();
      if (currentDot) {
        currentDot.classList.remove("active");
        currentDot.classList.add("caught");
      }
    } else {
      playMissSound();
      if (currentDot) {
        currentDot.classList.remove("active");
        currentDot.classList.add("missed");
      }
    }

    // 2. Line Visual Feedback
    const bugIdx = challenge.bugLine - 1;
    const bugRow = lineRows[bugIdx];

    if (outcome.result === "caught") {
      if (bugRow) {
        bugRow.classList.add("caught-line");
        createStamp(bugRow, { text: t("reveal.stamp"), isSuccess: true });
      }
    } else if (outcome.result === "wrong") {
      const pickedIdx = outcome.pickedLine - 1;
      const pickedRow = lineRows[pickedIdx];
      if (pickedRow) {
        pickedRow.classList.add("wrong-pick");
        const pickTag = document.createElement("span");
        pickTag.className = "your-pick-tag";
        pickTag.textContent = t("reveal.yourPick");
        pickedRow.querySelector(".code-line-content")?.appendChild(pickTag);
      }
      if (bugRow) {
        bugRow.classList.add("bug-flash", "glitch");
      }
    } else if (outcome.result === "timeout") {
      if (bugRow) {
        bugRow.classList.add("bug-line");
      }
      const timeoutChip = document.createElement("span");
      timeoutChip.className = "chip chip-warn";
      timeoutChip.textContent = t("reveal.timeout");
      statusBanner.appendChild(timeoutChip);
    }

    // 3. Fix Line & Strike-Through
    if (bugRow) {
      bugRow.classList.add("strike-line");
      const gutter = bugRow.querySelector(".code-line-gutter");
      if (gutter) gutter.textContent = `-${challenge.bugLine}`;

      const fixRow = document.createElement("div");
      fixRow.className = "code-line-row fix-line";

      const fixGutter = document.createElement("span");
      fixGutter.className = "code-line-gutter";
      fixGutter.textContent = "+";
      fixRow.appendChild(fixGutter);

      const fixContent = document.createElement("div");
      fixContent.className = "code-line-content";
      const fixTextWrap = document.createElement("div");
      fixTextWrap.className = "code-line-text";
      fixTextWrap.appendChild(highlightLine(challenge.fix));
      fixContent.appendChild(fixTextWrap);
      fixRow.appendChild(fixContent);

      if (bugRow.nextSibling) {
        editorBody.insertBefore(fixRow, bugRow.nextSibling);
      } else {
        editorBody.appendChild(fixRow);
      }

      bugRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    recalculateFit();

    // 4. Reveal Panel
    revealPanel = document.createElement("div");
    revealPanel.className = "reveal-panel";

    const header = document.createElement("div");
    header.className = "reveal-header";

    const heading = document.createElement("h3");
    heading.className = `reveal-heading ${outcome.result}`;
    if (outcome.result === "caught") {
      heading.textContent = t("reveal.caught");
    } else if (outcome.result === "wrong") {
      heading.textContent = t("reveal.wrong");
    } else {
      heading.textContent = t("reveal.timeout");
    }
    header.appendChild(heading);

    const conceptChip = document.createElement("span");
    conceptChip.className = "chip reveal-concept-chip";
    conceptChip.textContent = challenge.concept;
    header.appendChild(conceptChip);
    revealPanel.appendChild(header);

    // Run it console
    const consoleBox = document.createElement("div");
    consoleBox.className = "run-console";

    const callLine = document.createElement("div");
    callLine.className = "console-call";
    callLine.textContent = `> ${challenge.call}`;
    consoleBox.appendChild(callLine);

    const shouldLine = document.createElement("div");
    shouldLine.className = "console-should";
    shouldLine.textContent = `${t("reveal.should")} ${challenge.expected}`;
    consoleBox.appendChild(shouldLine);

    const gotLine = document.createElement("div");
    gotLine.className = "console-got";
    gotLine.textContent = `${t("reveal.got")} ${challenge.aiGot}`;
    consoleBox.appendChild(gotLine);

    revealPanel.appendChild(consoleBox);

    // Why text
    const whyP = document.createElement("p");
    whyP.className = "reveal-why";
    whyP.textContent = challenge.why;
    revealPanel.appendChild(whyP);

    // Next / Result button
    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "btn btn-primary reveal-next-btn";
    nextBtn.textContent = currentIndex < total - 1 ? t("reveal.next") : t("reveal.last");
    nextBtn.addEventListener("click", () => {
      onNext(outcome);
    });
    revealPanel.appendChild(nextBtn);

    // Hide confirm button wrap and append reveal panel
    confirmWrap.style.display = "none";
    if (window.innerWidth >= 900) {
      metaCol.appendChild(revealPanel);
    } else {
      codeCol.appendChild(revealPanel);
    }
  }

  // Keyboard navigation
  function handleKeyDown(e) {
    if (e.key === "m" || e.key === "M") {
      toggleMute();
      return;
    }

    if (isRevealed) {
      if (e.key === "n" || e.key === "N" || e.key === "ArrowRight") {
        e.preventDefault();
        const nextBtn = revealPanel?.querySelector(".reveal-next-btn");
        if (nextBtn) nextBtn.click();
      }
      return;
    }

    if (isTyping || isLocked) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = selectedLine === null ? 1 : Math.min(challenge.code.length, selectedLine + 1);
      selectLineNumber(next);
      lineRows[next - 1]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = selectedLine === null ? 1 : Math.max(1, selectedLine - 1);
      selectLineNumber(prev);
      lineRows[prev - 1]?.focus();
    } else if (e.key === "Enter") {
      if (selectedLine !== null && !confirmBtn.disabled) {
        e.preventDefault();
        handleConfirm();
      }
    }
  }

  window.addEventListener("keydown", handleKeyDown);

  // Debounced resize
  let resizeTimeout = null;
  function handleResize() {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      recalculateFit();
      arrangeColumns();
    }, 150);
  }
  window.addEventListener("resize", handleResize);

  // Column containers
  const codeCol = document.createElement("div");
  codeCol.className = "play-column-code";

  const metaCol = document.createElement("div");
  metaCol.className = "play-column-meta";

  function arrangeColumns() {
    const isLaptop = window.innerWidth >= 900;
    while (codeCol.firstChild) codeCol.removeChild(codeCol.firstChild);
    while (metaCol.firstChild) metaCol.removeChild(metaCol.firstChild);

    if (isLaptop) {
      codeCol.appendChild(codeCard);

      metaCol.appendChild(topbar);
      metaCol.appendChild(taskCard);
      metaCol.appendChild(confirmWrap);
      if (revealPanel) metaCol.appendChild(revealPanel);
    } else {
      codeCol.appendChild(topbar);
      codeCol.appendChild(taskCard);
      codeCol.appendChild(codeCard);
      codeCol.appendChild(confirmWrap);
      if (revealPanel) codeCol.appendChild(revealPanel);
    }
  }

  arrangeColumns();
  layout.appendChild(codeCol);
  layout.appendChild(metaCol);
  root.appendChild(layout);

  renderLines();
  recalculateFit();

  // Start Typing Effect
  typingHandle = startTyping({
    lines: challenge.code,
    onProgress: (typedLines, activeLine) => {
      renderLines(typedLines, activeLine);
      playKeyTick();
    },
    onComplete: () => {
      isTyping = false;
      renderLines();
      if (statusBanner.contains(bannerText)) {
        statusBanner.removeChild(bannerText);
      }
      const findText = document.createElement("span");
      findText.className = "find-hint";
      findText.textContent = t("play.find");
      statusBanner.appendChild(findText);

      emit("snippet:typed", { id: challenge.id, index: currentIndex });

      // Start Countdown Timer
      timer = createTimer({ totalSeconds: CONFIG.secondsPerSnippet ?? 30 });
      timer.start();

      function updateTimer() {
        if (isLocked) return;
        const st = timer.getStatus();
        timerText.textContent = String(st.secondsShown);
        const offset = circ * (1 - st.progress);
        progressCircle.setAttribute("stroke-dashoffset", String(offset));

        if (st.isWarning) {
          progressCircle.classList.add("warn");
          timerText.classList.add("warn");
          if (lastTickedSecond !== st.secondsShown) {
            lastTickedSecond = st.secondsShown;
            playTimerTick();
          }
        } else {
          progressCircle.classList.remove("warn");
          timerText.classList.remove("warn");
        }

        if (st.isExpired) {
          timer.stop();
          isLocked = true;
          const outcome = {
            id: challenge.id,
            index: currentIndex,
            pickedLine: selectedLine,
            result: "timeout",
            seconds: CONFIG.secondsPerSnippet ?? 30,
            challenge
          };
          emit("snippet:answered", outcome);
          onAnswer(outcome);
          triggerReveal(outcome);
          return;
        }

        rafTimerId = requestAnimationFrame(updateTimer);
      }

      rafTimerId = requestAnimationFrame(updateTimer);
    }
  });

  return {
    leave: () => {
      if (typingHandle) typingHandle.cancel();
      if (timer) timer.stop();
      if (rafTimerId) cancelAnimationFrame(rafTimerId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    },
    setLine: (num) => {
      if (isTyping && typingHandle) {
        typingHandle.finishImmediately();
      }
      selectLineNumber(num);
    },
    confirm: () => handleConfirm(),
    triggerReveal: (outcome) => triggerReveal(outcome)
  };
}

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
 * Standard screen enter for round progression.
 * @param {object} params
 * @param {string} [params.packId="b"]
 * @param {string[]} [params.challengeSet]
 * @param {number} [params.beat]
 */
export function enter(params = {}) {
  const packId = params.packId || "b";
  const challengeSet = params.challengeSet || null;
  const beat = typeof params.beat === "number" ? params.beat : null;

  let challenges = [];
  if (challengeSet && Array.isArray(challengeSet) && challengeSet.length > 0) {
    challenges = challengeSet.map((id) => getChallenge(id)).filter(Boolean);
  } else {
    challenges = buildRound(packId);
  }

  const total = challenges.length;
  let currentIndex = 0;
  const pastResults = [];
  const recordedOutcomes = [];

  function loadCurrentSnippet() {
    if (activePlayInstance) {
      activePlayInstance.leave();
      activePlayInstance = null;
    }

    const currentChallenge = challenges[currentIndex];

    activePlayInstance = mountPlayScreen(currentRoot, {
      challenge: currentChallenge,
      currentIndex,
      total,
      pastResults,
      onAnswer: (outcome) => {
        pastResults.push(outcome.result);
        recordedOutcomes.push(outcome);
      },
      onNext: () => {
        if (currentIndex < total - 1) {
          currentIndex += 1;
          loadCurrentSnippet();
        } else {
          // Complete round
          const score = recordedOutcomes.filter((r) => r.result === "caught").length;
          emit("round:done", {
            packId,
            score,
            total,
            results: recordedOutcomes
          });

          if (navigateFn) {
            navigateFn("result", {
              packId,
              challengeSet,
              beat,
              results: recordedOutcomes,
              total
            });
          }
        }
      }
    });
  }

  loadCurrentSnippet();
}

/**
 * Standard screen leave.
 */
export function leave() {
  if (activePlayInstance) {
    activePlayInstance.leave();
    activePlayInstance = null;
  }
  if (currentRoot) {
    while (currentRoot.firstChild) {
      currentRoot.removeChild(currentRoot.firstChild);
    }
  }
}
