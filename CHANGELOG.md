# Changelog

All notable changes to the Catch the AI project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

---

## [1.0.0] - 2026-10-27

### Added
- **Core Engine & Architecture:**
  - Decoupled event bus (`events.js`) coordinating screens, audio, analytics, and game loops.
  - Mulberry32 seeded pseudo-random number generator and Fisher-Yates shuffle (`rng.js`).
  - Modular challenge packs (`pack-beginner.js`, `pack-developer.js`) with 20 active challenges.
  - Automated Node content verification tool (`tools/verify-content.mjs`).
  - Automated client-side test suite (`selftest.js`) verifying 14 correctness checks.
- **Visual Presentation & Code Editor:**
  - Token-driven visual theme matching wrench-wise.com with light and dark mode support (`tokens.css`).
  - Syntax tokenizer and highlighter (`highlight.js`) with keyword, string, number, and function coloring.
  - Monospace font auto-fit algorithm using canvas `measureText` (11px to 16px).
  - Character-by-character AI typing effect with skip-on-tap and reduced motion bypass (`fx/typing.js`).
  - 56px SVG countdown timer ring with tabular numbers and 5-second warning pulse (`timer.js`).
  - Accessible code line picking with radiogroup semantics, full-width touch targets, and confirm button.
- **Home Screen & Animations:**
  - Ambient floating code symbols in background with visibility change pausing (`fx/ambient.js`).
  - Stable, professional hero editor preview cycling through challenges with brand scanline and CAUGHT stamp (`fx/hero.js`).
  - Mode selection cards showing pack tagline and saved best scores.
  - How to play guide, educational snippets disclosure, and optional live session banner.
- **Reveal Experience:**
  - Green line flash, CAUGHT stamp landing animation, and chime audio on correct catches.
  - Red bug line glitch flash, "Your pick" tag, and soft miss thud on incorrect selections.
  - Real-time fix diff inserting replacement line with strike-through and gutter symbols (`-` and `+`).
  - "Run it" console displaying function invocation, expected output, and actual buggy return value.
- **Results, Scoring & Conversion:**
  - Animated 0.8s score count-up, 8 sequential pop-in tally dots with hover tooltips, and rank badge landing.
  - Average catch time calculation and missed concept analysis chips.
  - Review disclosure listing all 8 snippets with educational explanations.
  - Direct WhatsApp CTA button opening pre-filled sales inquiry to 917550077725.
  - Best score persistence in `localStorage` under `cta-best` with "New best" indicator.
- **Challenge Links & Sharing:**
  - Self-contained challenge links with URL query parameters (`/?set=...&beat=...`).
  - Social share card generator for Status (1080x1920) and Post (1080x1350) canvas images.
  - Native Web Share API integration with automatic PNG download fallback.
  - WhatsApp share intent link and clipboard link copy with 2-second feedback state.
- **Sound System:**
  - Web Audio API synthesizers for key-click ticks, countdown ticks, catch chimes, miss thuds, and fanfare.
  - Header mute toggle button synchronized with `localStorage` under `cta-muted`.
- **Demo & Presenter Modes:**
  - Automated Demo Mode (`?demo=1`) with animated tap dot for vertical and horizontal reel recordings.
  - Presenter Mode (`?present=1`) with enlarged 20px typography and keyboard controls for live sessions.
- **Analytics & Accessibility:**
  - GA4 and Meta Pixel event pipeline listening to event bus emissions.
  - Visible focus rings (`:focus-visible`) and off-screen `aria-live` region for screen readers.
