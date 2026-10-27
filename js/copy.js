// Centralized UI copy dictionary and template interpolation function.
// Uses config.js for course name defaults.
// Used across all UI screens, result generation, sharing, and self-tests.

import { CONFIG } from "../config.js";

export const COPY = {
  // Home Screen
  "home.eyebrow": "30 seconds a snippet",
  "home.title": "Catch the AI",
  "home.subtitle": "AI wrote {total} pieces of code. Each one has a hidden mistake. How many can you catch?",
  "home.best": "Best: {score}/{total}",
  "home.how1": "Read what the code should do",
  "home.how2": "Tap the line with the mistake",
  "home.how3": "See what AI got wrong",
  "home.aboutTitle": "About these snippets",
  "home.aboutBody": "These are the kinds of mistakes AI coding tools really make. Each snippet was written and checked by the Wrench Wise team.",
  "home.challengeBeat": "A friend caught {beat} of {total} in {mode} mode. Can you beat that?",
  "home.challengeSet": "Someone sent you a set of {total} snippets in {mode} mode.",
  "home.challengeBtn": "Take the challenge",

  // Play Screen
  "play.counter": "Snippet {n} of {total}",
  "play.taskLabel": "The task",
  "play.writing": "AI is writing code",
  "play.find": "Find the mistake",
  "play.aiChip": "AI wrote this",
  "play.notesOn": "Line notes: On",
  "play.notesOff": "Line notes: Off",
  "play.pick": "Tap the line with the mistake",
  "play.confirm": "Line {line} is the mistake",
  "play.linesLabel": "Code lines. Pick the line with the mistake.",

  // Reveal
  "reveal.caught": "Caught it",
  "reveal.wrong": "This one got past you",
  "reveal.timeout": "Time's up",
  "reveal.yourPick": "Your pick",
  "reveal.stamp": "CAUGHT",
  "reveal.run": "Run it",
  "reveal.should": "Should give",
  "reveal.got": "AI's code",
  "reveal.next": "Next snippet",
  "reveal.last": "See my score",

  // Result Screen
  "result.youCaught": "You caught",
  "result.of": "of {total}",
  "result.support": "AI writes code fast. Checking it still takes someone who knows the basics.",
  "result.avg": "Average catch time: {seconds} s",
  "result.newBest": "New best",
  "result.tripped": "What tripped you up",
  "result.review": "See all {total} again",
  "result.again": "Play again",
  "result.switch": "Try {mode} mode",

  // Result Lines (Section 10d)
  "result.lineZero": "AI wrote all {total}. This time, every mistake got past you.",
  "result.lineSome": "AI wrote all {total}. You caught {score}.",
  "result.lineAll": "AI wrote all {total}. You caught every one.",

  // Head to Head Lines (Section 10e)
  "h2h.win": "You caught {you}. Your friend caught {friend}. You win this one.",
  "h2h.tie": "You both caught {score}. It's a tie.",
  "h2h.loss": "Your friend caught {friend}. You caught {you}. Rematch?",

  // Call to Action
  "cta.title": "Want to catch these every time?",
  "cta.body": "The {course} covers the basics behind these mistakes, like loops, conditions, hash maps and sorting.",
  "cta.whatsapp": "Talk to us on WhatsApp",
  "cta.program": "See the program",
  "cta.website": "Visit wrench-wise.com",

  // Free Live Session
  "session.label": "Free live session",
  "session.btn": "Save my seat",

  // Share Card & Actions
  "share.title": "Challenge a friend",
  "share.image": "Share my score",
  "share.whatsapp": "Send on WhatsApp",
  "share.copy": "Copy challenge link",
  "share.copied": "Copied",
  "share.status": "Status",
  "share.post": "Post",
  "share.imageLine": "AI wrote {total} pieces of code. I caught {score}.",
  "share.imageBeat": "Can you beat me?",
  "share.imageMatch": "Can you match that?",

  // Sales WhatsApp & Share Link Templates (Section 10g, 10h)
  "sales.message": "Hi, I just played Catch the AI on {mode} mode and caught {score} of {total} mistakes. I'd like to know more about the {course}.",
  "share.text": "AI wrote {total} pieces of code, each with a hidden mistake. I caught {score}. Can you beat me? {link}",
  "share.textPerfect": "AI wrote {total} pieces of code, each with a hidden mistake. I caught all {total}. Can you match that? {link}",

  // Presenter Mode
  "presenter.end": "Questions? Ask in the chat.",

  // Footer
  "footer.built": "Built with code by Wrench Wise",
  "footer.learn": "Learn to build apps like this",

  // Ranks (Section 10c)
  "rank.freshEyes": "Fresh Eyes",
  "rank.gettingSharp": "Getting Sharp",
  "rank.sharpReviewer": "Sharp Reviewer",
  "rank.bugHunter": "Bug Hunter",
  "rank.toughest": "AI's Toughest Reviewer"
};

/**
 * Interpolate values into a localized string template.
 * @param {string} key
 * @param {Record<string, *>} [values]
 * @returns {string}
 */
export function t(key, values = {}) {
  const template = COPY[key] ?? key;
  const merged = {
    course: CONFIG.courseName,
    ...values
  };
  return template.replace(/\{(\w+)\}/g, (match, param) => {
    return merged[param] !== undefined ? String(merged[param]) : match;
  });
}
