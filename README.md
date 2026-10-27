<div align="center">

# 🤖 Catch the AI
### *Fast-Paced Developer Debugging Game: Spot Subtle Bugs in AI-Generated Code*

Test your code review reflexes! Inspect realistic AI-written code snippets and find the hidden bug before the 30-second countdown runs out.

[![Live Deployment](https://img.shields.io/badge/Live_App-catch--the--ai.vercel.app-EC4899?style=for-the-badge&logo=vercel&logoColor=white)](https://catch-the-ai.vercel.app/)
[![Self-Test Suite](https://img.shields.io/badge/Test_Suite-Passing-22C55E?style=for-the-badge&logo=checkmarx&logoColor=white)](https://catch-the-ai.vercel.app/?test=1)
[![Verified Snippets](https://img.shields.io/badge/Content-20_Verified_Bug_Snippets-06B6D4?style=for-the-badge&logo=javascript&logoColor=white)](tools/verify-content.mjs)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Pradeep--B28%2FCatch__The__AI-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Pradeep-B28/Catch_The_AI)
[![Author](https://img.shields.io/badge/Author-Pradeep_B-0B2A45?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/pradeepb-2k)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

<p align="center">
  <a href="#-how-to-play-in-3-steps">How to Play</a> •
  <a href="#-engine-architecture--features">Architecture</a> •
  <a href="#-repository-structure">Repository Structure</a> •
  <a href="#-local-development">Local Setup</a> •
  <a href="#-automated-content-verification">Verification Harness</a> •
  <a href="#-license">License</a> •
  <a href="#-author--contact">Author & Contact</a>
</p>

</div>

---

## 🎮 How to Play in 3 Steps

1. **Read what the code should do:** Review the specification prompt at the top of the challenge card.
2. **Tap the line with the mistake:** Inspect the syntax, logic, boundary conditions, or async handling and select the exact line with the AI defect before the timer expires.
3. **See what the AI got wrong:** Review the side-by-side color-coded fix diff, watch the simulated terminal console output, and master the underlying engineering concept.

---

## ⚡ Engine Architecture & Features

- **Decoupled Event Bus:** All UI views, sound effects, analytics, and game state communicate through an event bus (`events.js`). No screen directly manipulates another screen's internal DOM.
- **Drift-Free High-Precision Timer:** The 30-second countdown calculates true elapsed time using differences between `performance.now()` timestamps rather than relying on inaccurate `setInterval` ticks. Automatically pauses when browser tab visibility is lost.
- **Canvas Auto-Fit Font Scaling:** Monospace code font size dynamically scales between 11px and 16px via canvas `measureText` metrics, ensuring long lines fit without horizontal scrollbars or awkward line wraps.
- **Stateless URL Challenge Links:** Challenge links carry snippet IDs and target scores directly in URL query parameters (`?set=b01.b02.b03...&beat=6`). The client validates and serves the exact customized tournament set with zero server dependencies.
- **Content Verification Harness:** Every challenge is backed by an automated runner (`tools/verify-content.mjs`) that executes both the buggy AI code and the corrected fix in Node.js to guarantee 100% legitimate runtime bugs.

---

## 📂 Repository Structure

```
Catch_The_AI/
├── index.html        Main application structure, HUD controls, and game card
├── config.js         Configuration flags and live domain endpoints
├── LICENSE           MIT Open Source License
├── README.md         Project overview, architecture, and developer instructions
├── styles/
│   ├── base.css      CSS reset, design tokens, and core layout
│   ├── game.css      Card glassmorphism, timer HUD, code highlighting, and diff views
│   └── tokens.css    Theme color palette and typography tokens
├── js/
│   ├── main.js       Game initialization and lifecycle orchestration
│   ├── events.js     Decoupled publish-subscribe event bus
│   ├── game.js       Game loop, rounds, scoring, and streak tracking
│   ├── content.js    20 real-world AI coding snippets, tasks, and diff explanations
│   ├── timer.js      High-precision performance.now() countdown clock
│   ├── fitcheck.js   Canvas measureText code card auto-fit scaler
│   ├── highlight.js  Client-side lightweight JavaScript syntax highlighter
│   ├── router.js     Screen state transitions and view routing
│   ├── share.js      WhatsApp share text and native Web Share integration
│   ├── shareImage.js Canvas-rendered high-res achievement card generator
│   ├── selftest.js   Browser automated verification suite
│   ├── score.js      Score calculations, combo multipliers, and localStorage bests
│   ├── rng.js        Seeded PRNG for reproducible randomized challenge sets
│   ├── links.js      Deep-link parser and URL challenge set generator
│   └── audio.js      Procedural Web Audio buzzers, tick-tocks, and success chimes
└── tools/
    ├── verify-content.mjs Node.js test harness validating all 20 bugs & fixes
    ├── og.html            Open Graph preview banner canvas generator
    └── render_share.html  Offline share card preview tool
```

---

## 💻 Local Development

Catch the AI runs natively in modern browsers with zero build tools required:

```bash
# Clone the repository
git clone https://github.com/Pradeep-B28/Catch_The_AI.git
cd Catch_The_AI

# Start a local static file server
python -m http.server 8000
```

Open `http://localhost:8000/` in your browser.

---

## 🧪 Automated Content Verification

To run the automated verification test harness that executes all 20 code snippets in Node.js:

```bash
node tools/verify-content.mjs
```

To run the full browser-based engine test suite (covering rounds, timers, streak calculations, URL serialization, and canvas scaling):
- Open `http://localhost:8000/?test=1` in your browser.

---

## 📄 License

This project is open-source and released under the **[MIT License](LICENSE)**.

```
Copyright (c) 2026 Pradeep B (Pradeep-B28) & Wrench Wise
```

---

## 👨‍💻 Author & Contact

**Pradeep B**  
*Java & DSA Master Trainer | Full-Stack Architect | Web Platform Engineer*

- 🌐 **Softech Career & Placement Portal:** [reachsoftech.onrender.com](https://reachsoftech.onrender.com/home)
- 🌌 **3D Interactive Developer Portfolio:** [pradeep-b28.github.io/GIT_3D_Portfolio](https://pradeep-b28.github.io/GIT_3D_Portfolio/)
- 💻 **GitHub Profile:** [@Pradeep-B28](https://github.com/Pradeep-B28)
- 💼 **LinkedIn:** [linkedin.com/in/pradeepb-2k](https://www.linkedin.com/in/pradeepb-2k)
- 📧 **Email:** [pradeepbashaa@gmail.com](mailto:pradeepbashaa@gmail.com)
