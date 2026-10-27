# Upgrade Guide for Catch the AI

This guide contains step-by-step recipes for maintaining, updating, and extending Catch the AI.

---

## Recipe 1: Change WhatsApp Number, Course Name, Session Card, or Links

All business settings live in `config.js`. Never change these anywhere else in the codebase.

1. Open `config.js`.
2. To update the WhatsApp sales contact:
   Set `salesWhatsApp: "917550077725"`. Use digits only, country code first (11 to 15 digits). If left empty, the WhatsApp button is hidden and "See the program" is shown instead.
3. To update the course name:
   Change `courseName: "Certification Program in AI-Powered Software Engineering & DSA"`.
4. To enable a live webinar session card:
   Set `session.enabled = true`, and fill `title`, `when` (for example "Sunday 9 November, 8:30 PM IST"), and `url`.
5. After editing, verify that all tests pass by running:
   ```bash
   node tools/verify-content.mjs
   ```
   And opening `http://localhost:8000/?test=1` in Chrome.

---

## Recipe 2: Add a New Challenge

1. Open the relevant pack file: `content/pack-beginner.js` or `content/pack-developer.js`.
2. Duplicate an existing challenge object and assign the next sequential ID (for example, `b11` or `d11`).
3. Fill every required field:
   - `id`: unique lowercase string
   - `title`: short descriptive title
   - `level`: integer (1 to 3)
   - `task`: plain text explaining what the code should do
   - `code`: array of code lines containing exactly one bug
   - `bugLine`: 1-based index of the line containing the mistake
   - `fix`: replacement code line that fixes the bug
   - `call`: example function invocation string
   - `expected`: expected return value string
   - `aiGot`: actual buggy return value string
   - `why`: concise educational explanation of why the bug occurred
   - `concept`: category name (for example, "Comparison vs Assignment")
   - `notes`: array of line-by-line annotations (one entry per line of code)
   - `checks`: array of test assertions for Node verification
4. Run the verification runner to prove the bug and the fix:
   ```bash
   node tools/verify-content.mjs
   ```
5. Have an instructor read the code and task to ensure clarity before shipping.

---

## Recipe 3: Retire a Challenge

Never delete an existing challenge ID from a pack. Challenge links shared in the past may reference that ID.

1. Open the pack file containing the challenge.
2. Add `retired: true` to the challenge object:
   ```javascript
   {
     id: "b01",
     retired: true,
     ...
   }
   ```
3. Retired challenges are excluded from new randomized rounds, but existing challenge links referencing them will continue to function.

---

## Recipe 4: Add a New JavaScript Pack (e.g. Full Stack)

1. Create a new pack file in `content/`, for example `content/pack-fullstack.js`.
2. Follow the structure of `pack-beginner.js`, exporting an object with `id`, `name`, `tagline`, and `challenges`.
3. In `content/index.js`, import the new pack and add it to the exported `PACKS` array:
   ```javascript
   import { FULLSTACK_PACK } from "./pack-fullstack.js";
   export const PACKS = [BEGINNER_PACK, DEVELOPER_PACK, FULLSTACK_PACK];
   ```
4. In `config.js`, add the new pack ID to `packsOnHome`:
   ```javascript
   packsOnHome: ["b", "d", "fs"]
   ```
5. Run `node tools/verify-content.mjs` to verify all snippets pass.

---

## Recipe 5: Turn an Optional Feature On or Off

In `config.js`, adjust the booleans inside `features`:
- `sound`: controls Web Audio sound effects
- `darkTheme`: enables dark mode switching
- `lineNotes`: enables beginner line notes
- `challengeLinks`: enables challenge deep link processing
- `shareImage`: enables client-side share card generation
- `presenterMode`: enables webinar presenter mode (`?present=1`)
- `dailyEight`: enables Daily 8 challenge mode

Setting any flag to `false` cleanly disables the feature without console errors.

---

## Recipe 6: Use GA4 Data to Improve Content

In Google Analytics 4, monitor the `snippet_answer` event:
- **Too Easy:** Any challenge caught by more than 90% of players lacks educational friction. Review the snippet and introduce a more subtle logic mistake.
- **Too Hard / Ambiguous:** Any challenge caught by fewer than 15% of players is either too complex for 30 seconds or has an ambiguous task prompt. Clarify the task description or simplify the code logic.

---

## Recipe 7: Release Steps

1. In `config.js`, update `version`, for example `"1.1.0"`.
2. Add an entry to `CHANGELOG.md` with the version, date, and changes.
3. Run the verification tests:
   ```bash
   node tools/verify-content.mjs
   ```
4. Check that `http://localhost:8000/?test=1` reports `ALL PASS`.
5. Commit and tag the release in git:
   ```bash
   git add .
   git commit -m "Release v1.1.0"
   git tag v1.1.0
   git push origin master --tags
   ```

---

## Recipe 8: How to Run Any Future Upgrade with Antigravity

When you want to run a future upgrade using Antigravity, copy and paste this exact prompt:

```text
Read PROJECT_BRIEF.md, UPGRADE_GUIDE.md and CHANGELOG.md. I want to add: [describe the feature]. Create a branch called upgrade-[short-name]. Follow Section 3 of PROJECT_BRIEF.md. Plan the work in phases and stop after each one with a Phase Report. Do not change content/ unless I ask. Keep every self-test and the content check passing, and add tests for the new feature. Give me the Vercel preview link and wait. Merge only when I reply "Ship it".
```

---

## Recipe 9: Future Upgrades Prepared by this Architecture

This codebase is architected to support these planned expansions:

1. **Daily 8:** The engine (`dailySet` in `content.js`) and seeded PRNG (`mulberry32` in `rng.js`) are already built and tested. It needs additional challenges (at least 30 per pack) before enabling `features.dailyEight`.
2. **Full Stack Pack:** The modular pack structure in `content/` allows adding new packs in minutes.
3. **Tamil Text Support:** UI strings are centralized in `copy.js`. Adding `copy.ta.js` and a language selector enables full local language localization.
4. **Two-Bug Hard Mode:** Requires updating the challenge schema to support two bug lines and adjusting `game.js` to track two selections.
5. **Python or Java Packs:** The UI and game engine are language-agnostic. A Node verification runner for Python (`python -c`) or Java is required to verify new language packs.
6. **Leaderboards:** Requires an external database and backend service to record verified player sessions.
