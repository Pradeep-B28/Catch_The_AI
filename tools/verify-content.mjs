// Content check for Catch the AI.
// Run from the project folder:  node tools/verify-content.mjs
//
// For every challenge it:
//   1. checks every field against content/SCHEMA.md
//   2. runs the AI's code and confirms it really gives the wrong answer shown in the app
//   3. swaps in the fix and confirms it gives the right answer, plus every extra check
//   4. checks the text for long dashes, emojis and banned phrases
// It prints PASS or FAIL for each challenge and exits with code 1 if anything fails.

import vm from "node:vm";
import { PACKS } from "../content/index.js";

let roundSize = 8;
try {
  const cfg = await import("../config.js");
  if (cfg.CONFIG && Number.isInteger(cfg.CONFIG.roundSize)) roundSize = cfg.CONFIG.roundSize;
} catch {
  // config.js not created yet. Use the default round size of 8.
}

const MAX_LINE = 42;
const MIN_LINES = 3;
const MAX_LINES = 14;
const BANNED = [
  "guarantee", "placement", "salary", "lakh", "take your job", "replace you",
  "stupid", "dumb", "idiot", "noob", "loser"
];
const DASHES = /[\u2012\u2013\u2014\u2015]/;
const EMOJI = /\p{Extended_Pictographic}/u;

let failures = 0;
const rows = [];
const seenIds = new Set();

function fail(where, msg) {
  failures++;
  console.log(`  FAIL  ${where}: ${msg}`);
}

function run(lines, call) {
  const source = lines.join("\n") + "\n;JSON.stringify((" + call + "));";
  try {
    const out = vm.runInNewContext(source, {}, { timeout: 1000 });
    return out === undefined ? "undefined" : out;
  } catch (e) {
    return "Error: " + (e && e.message ? e.message : String(e));
  }
}

function checkText(where, label, text) {
  if (typeof text !== "string") return;
  if (DASHES.test(text)) fail(where, `${label} has a long dash`);
  if (EMOJI.test(text)) fail(where, `${label} has an emoji`);
  const lower = text.toLowerCase();
  for (const b of BANNED) if (lower.includes(b)) fail(where, `${label} uses the banned phrase "${b}"`);
}

const isStr = (v) => typeof v === "string" && v.trim().length > 0;

for (const pack of PACKS) {
  const pw = `pack ${pack && pack.id}`;
  if (!pack || !/^[a-z]$/.test(pack.id)) { fail(pw, "id must be one lowercase letter"); continue; }
  if (!isStr(pack.name)) fail(pw, "name missing");
  if (!isStr(pack.tagline)) fail(pw, "tagline missing");
  if (pack.language !== "javascript") fail(pw, "language must be javascript (the checker only runs JavaScript)");
  if (!Number.isInteger(pack.packVersion) || pack.packVersion < 1) fail(pw, "packVersion must be a whole number from 1");
  checkText(pw, "name", pack.name);
  checkText(pw, "tagline", pack.tagline);
  if (!Array.isArray(pack.challenges)) { fail(pw, "challenges must be a list"); continue; }

  const active = pack.challenges.filter((c) => !c.retired).length;
  if (active < roundSize) fail(pw, `has ${active} active challenges, needs at least ${roundSize}`);

  let tallest = { id: "", rows: 0 };

  for (const c of pack.challenges) {
    const w = c && c.id ? c.id : "(no id)";
    const idPattern = new RegExp("^" + pack.id + "\\d{2,3}$");
    if (!idPattern.test(c.id)) fail(w, `id must be "${pack.id}" followed by 2 or 3 digits`);
    if (seenIds.has(c.id)) fail(w, "id is used twice");
    seenIds.add(c.id);

    if (![1, 2, 3].includes(c.level)) fail(w, "level must be 1, 2 or 3");
    for (const f of ["title", "task", "why", "concept"]) if (!isStr(c[f])) fail(w, `${f} missing`);
    if (c.retired !== undefined && typeof c.retired !== "boolean") fail(w, "retired must be true or false");

    if (!Array.isArray(c.code) || c.code.length < MIN_LINES || c.code.length > MAX_LINES) {
      fail(w, `code must have ${MIN_LINES} to ${MAX_LINES} lines`);
      continue;
    }
    let longest = 0;
    c.code.forEach((line, i) => {
      if (typeof line !== "string") { fail(w, `line ${i + 1} is not text`); return; }
      if (line.length > MAX_LINE) fail(w, `line ${i + 1} is ${line.length} characters (max ${MAX_LINE})`);
      if (line.includes("\t")) fail(w, `line ${i + 1} has a tab. Use spaces`);
      if (/\s$/.test(line)) fail(w, `line ${i + 1} has a space at the end`);
      if (DASHES.test(line)) fail(w, `line ${i + 1} has a long dash`);
      longest = Math.max(longest, line.length);
    });

    if (!Number.isInteger(c.bugLine) || c.bugLine < 1 || c.bugLine > c.code.length) {
      fail(w, "bugLine must point at a line of the code (counting from 1)");
      continue;
    }
    if (!isStr(c.fix)) { fail(w, "fix missing"); continue; }
    if (c.fix.length > MAX_LINE) fail(w, `fix is ${c.fix.length} characters (max ${MAX_LINE})`);
    if (c.fix === c.code[c.bugLine - 1]) fail(w, "fix is the same as the bug line");
    longest = Math.max(longest, c.fix.length);

    if (c.notes !== undefined) {
      if (!Array.isArray(c.notes) || c.notes.length !== c.code.length) fail(w, "notes must have one entry per code line");
      else c.notes.forEach((n, i) => checkText(w, `note ${i + 1}`, n));
    }

    for (const f of ["title", "task", "why", "concept"]) checkText(w, f, c[f]);

    const t = c.test || {};
    if (!isStr(t.call) || typeof t.expected !== "string" || typeof t.aiGot !== "string") {
      fail(w, "test needs call, expected and aiGot");
      continue;
    }
    if (t.expected === t.aiGot) fail(w, "expected and aiGot are the same, so there is no visible mistake");
    if (!Array.isArray(c.checks) || c.checks.length < 1) fail(w, "needs at least one extra check");

    const fixed = c.code.slice();
    fixed[c.bugLine - 1] = c.fix;

    const buggyOut = run(c.code, t.call);
    const fixedOut = run(fixed, t.call);
    const buggyOk = buggyOut === t.aiGot;
    const fixedOk = fixedOut === t.expected;
    if (!buggyOk) fail(w, `AI's code gave ${buggyOut}, but aiGot says ${t.aiGot}`);
    if (!fixedOk) fail(w, `fixed code gave ${fixedOut}, but expected says ${t.expected}`);

    let checksPassed = 0;
    for (const [call, want] of c.checks || []) {
      const got = run(fixed, call);
      if (got === want) checksPassed++;
      else fail(w, `fixed code: ${call} gave ${got}, expected ${want}`);
    }

    const rowsOnScreen = c.code.length * (c.notes ? 2 : 1);
    if (rowsOnScreen > tallest.rows) tallest = { id: c.id, rows: rowsOnScreen };

    rows.push({
      id: c.id,
      lines: c.code.length,
      longest,
      aiGot: buggyOk ? "PASS" : "FAIL",
      fixed: fixedOk ? "PASS" : "FAIL",
      checks: `${checksPassed}/${(c.checks || []).length}`,
      retired: c.retired ? "yes" : ""
    });
  }

  console.log(`Pack ${pack.id} (${pack.name}): ${active} active. Tallest on screen: ${tallest.id}`);
}

console.table(rows);
console.log(`Challenges checked: ${rows.length}. Round size: ${roundSize}.`);
if (failures) {
  console.log(`RESULT: FAIL (${failures} problem${failures === 1 ? "" : "s"})`);
  process.exit(1);
} else {
  console.log("RESULT: ALL PASS");
}
