# Catch the AI: Project Brief (v1, built to upgrade)

You are building a web app in this folder. Read this whole file before writing any code. Then read `content/SCHEMA.md`. Follow the phases in Section 11 in order, and stop at the end of each phase.

Some files are already here. Keep them:
- `config.js`: every business setting (Section 5)
- `content/`: the locked challenge packs (20 challenges) and `SCHEMA.md`
- `tools/verify-content.mjs`: runs every challenge's code and proves the mistake is real
- `package.json`: only so Node can run the content check. It has no dependencies. Never add any.

---

## 1. What we are building

Catch the AI is a quick game. An AI wrote 8 short pieces of code. Each one looks right but has one hidden mistake. You get 30 seconds to tap the line with the mistake.

Each snippet types itself onto the screen like an AI writing code. The timer ring starts. The player taps a line and locks it in. Then the answer lands: the mistake glows red, the fix slides in green, and a small console shows what the code should give and what the AI's code really gives, like "Should give 900. AI's code: -9000."

At the end: **"AI wrote all 8. You caught 6."** Then one tap opens WhatsApp to our sales team with the score already typed in, and one tap challenges a friend to beat it.

The headline moments are the AI typing, the catch (or the miss), and the final score. Spend the most care there.

**The message.** AI is a great tool that still makes mistakes. Catching them takes someone who knows the basics. We never say AI is bad, and we never say AI will take anyone's job.

**It must look like it belongs to wrench-wise.com.** Same colours, font, button shapes and white cards as the site (Section 7). The code card is a dark editor, like a real coding tool.

**The business goal.** This app is a lead magnet for the Certification Program in AI-Powered Software Engineering & DSA. A good game gives the sales team warm leads who have already felt their own skill gap. It is also the opening activity for our free live sessions.

Who it is for:
- **Beginner mode:** students, parents and career switchers with no coding background. Everyday code like a discount calculator or a bill splitter, with a plain-English note under every line.
- **Developer mode:** final-year students, freshers and working developers. Loops, binary search, hash maps, sorting and sliding windows.
- **Reel viewers.** It must look great in screen recordings, vertical and horizontal.

When there is a trade-off, follow this order:
1. The typing, the catch and the final score look stunning.
2. Every challenge and every number is exactly right (Section 10).
3. It runs smoothly on a mid-range Android phone.
4. The WhatsApp and share buttons work in one tap.
5. It is easy to upgrade (Section 3).
6. Everything else.

---

## 2. Hard rules

1. **Code.** Plain HTML, CSS and JavaScript (ES modules) only. No frameworks, libraries, CDNs, npm packages or web fonts. The only image files are the logo, the link preview image and app icons. Draw everything else in code: icons as inline SVG, share images on a canvas.
2. **Front-end only.** No backend, database, API keys, AI calls, accounts or forms. Never use `eval`, `new Function`, `setTimeout` with a string, or inline `onclick` attributes.
3. **Content is locked.** Never edit anything in `content/` or `tools/`. Run `node tools/verify-content.mjs` at the start of every phase. It must end with `RESULT: ALL PASS`. If you think a challenge is wrong, stop and tell me. Do not fix it yourself.
4. **No personal data.** The app never asks for a name, phone number or email. `localStorage` may hold only three keys: `cta-theme`, `cta-muted` and `cta-best`. Wrap every read and write in try and catch, and make the app work fine when storage is blocked.
5. **External scripts.** Only GA4 and the Meta Pixel, and only when their IDs are set in `config.js`. Never load them with `?test=1` or `?demo=1`.
6. **Tone.** Never mock the player. Low scores get encouragement. Never use these anywhere a user can see them: stupid, dumb, idiot, noob, loser, "take your job", "replace you", guarantee, placement, salary, "seats left", or any countdown other than the real game timer.
7. **Course name.** Always the full name from `config.courseName`. Never shorten it.
8. **Writing style.** All UI text and docs are in plain English with short sentences. No emojis. No em dashes (the long dash).
9. **Safety.** Never use `innerHTML` or `insertAdjacentHTML` with changing values. Build code lines and all dynamic text with `textContent`.
10. **Hidden means hidden.** `base.css` must include `[hidden] { display: none !important; }`. (In an earlier project, a CSS rule kept a "hidden" debug panel visible on the live site.)
11. **No debug output live.** No debug panels, test overlays or `console.log` in the live app. Test output appears only with `?test=1`.
12. **File size.** One job per file, under about 350 lines. Start every JS file with a 3-line comment: what it does, what it uses, what uses it.
13. **Phases.** At the end of every phase, stop and give a Phase Report (Section 12). Do not start the next phase until I say so.
14. **Stubborn bugs.** If the same bug survives two fix attempts, stop. Explain it in plain words and give me options. Do not keep looping.
15. **My actions.** I am not from a tech background. When you need me to do something (click, log in, approve), give numbered click-by-click steps.
16. **Commands.** Before running a terminal command, tell me in one line what it does.
17. **Branding.** Wrench Wise only. No other company names, logos or brand colours. No real people's names.

---

## 3. Built to upgrade

We have rebuilt earlier apps to add features. This one must be easy to grow. **An upgrade should feel like adding data or one new file, not rewriting code.** Follow every rule here.

1. **One settings file.** `config.js` holds every business setting. Changing the WhatsApp number, course name, round size, timer, links, analytics IDs or features must never need a code change anywhere else.
2. **One text file.** `js/copy.js` holds every word the player sees, except challenge content. Group the text by screen. Fill values with a small `t(key, values)` function, for example `t("result.line", { score: 6, total: 8 })`. A Tamil version later is then a new `copy.ta.js`, not a rewrite.
3. **Content as packs.** Challenges live in `content/`, follow `SCHEMA.md` and are listed in `content/index.js`. The app reads them through `js/content.js` only. Ids are permanent: a challenge is retired with `retired: true`, never deleted. Retired challenges never appear in new rounds, but old shared links still play them.
4. **Links that never break.** `?set=` and `?beat=` must keep working forever. Links carry challenge ids, not positions or random seeds. Accept 3 to 20 ids, so links survive a change in round size. Any new URL option must be optional.
5. **Screens are modules.** `js/router.js` shows one screen at a time. Each screen file exports `mount(root)`, `enter(params)` and `leave()`. Adding a screen means one new file and one line in the router's list.
6. **An event bus.** Game code never calls sound, analytics or sharing code directly. It sends events through `js/events.js` (`emit(name, data)` and `on(name, handler)`), and those modules listen. Adding a new tracker or effect means a new listener only. Use exactly these events:

| Event | Data |
|---|---|
| `app:ready` | none |
| `round:start` | `packId`, `ids`, `source` (`home`, `link`, `daily`, `demo`) |
| `snippet:shown` | `id`, `index` |
| `snippet:typed` | `id`, `index` |
| `snippet:answered` | `id`, `index`, `result` (`caught`, `wrong`, `timeout`), `seconds`, `pickedLine` |
| `round:complete` | `packId`, `ids`, `score`, `total`, `results`, `beat` |
| `share:image` | `size` (`post`, `status`) |
| `share:whatsapp` | none |
| `share:copy` | none |
| `cta:sales` | `packId`, `score`, `total` |
| `cta:website` | `spot` (`home`, `result`, `footer`) |
| `cta:session` | none |
| `theme:change` | `theme` |
| `sound:toggle` | `muted` |

7. **Logic without the page.** `game.js`, `timer.js`, `score.js`, `links.js`, `content.js` and `rng.js` contain no DOM code. They take inputs and return results. This makes them testable, and lets a future presenter mode or leaderboard reuse them.
8. **Design tokens.** Every colour, shadow and easing lives in `styles/tokens.css`. JavaScript reads tokens with `getComputedStyle`. A new look touches one file.
9. **Feature flags.** Every optional feature checks `config.features`. Turning one off hides it cleanly, with no errors and no empty gaps.
10. **Versions.** `config.version` (starting at 1.0.0) shows in the footer as "v1.0.0". Keep `CHANGELOG.md`. Tag each release in git (`v1.0.0`). The self-test prints the version.
11. **Tests grow with features.** Every feature adds its own checks to `selftest.js`. All must pass before any release.
12. **Upgrades use branches.** v1 deploys from `main` in Phase 6. Every later upgrade happens on a branch named `upgrade-<name>`, gets a Vercel preview link, and is merged only after I reply "Ship it". `UPGRADE_GUIDE.md` (Phase 6) explains this in plain words.

---

## 4. Tech setup

- Check `node --version` is 18 or newer.
- Run locally with a simple static server: `npx serve .`
  - If that fails, use `python -m http.server 8000`.
- Use ES modules (`<script type="module">`).
- Folder structure (new files in plain text, files already here marked "given"):

```
catch-the-ai/
  index.html
  manifest.json
  package.json          given. Only for the content check. No dependencies.
  config.js             given. Every business setting (Section 5)
  styles/
    tokens.css          every colour, shadow and easing (Section 7)
    base.css            reset, layout, header, footer, buttons, cards
    game.css            code card, timer, reveal, result
  assets/               logo.png (I provide), og-image.png, app icons
  content/              given and locked
    index.js            the list of packs
    pack-beginner.js    10 challenges
    pack-developer.js   10 challenges
    SCHEMA.md           what each field means
  tools/
    verify-content.mjs  given and locked. Run with: node tools/verify-content.mjs
    og.html             draws the link preview image (Section 9)
  js/
    main.js             starts the app, reads URL flags, starts the router
    router.js           shows one screen at a time
    events.js           tiny event bus
    copy.js             every piece of UI text, and t()
    content.js          loads packs, finds challenges, builds rounds
    rng.js              seeded random numbers (daily sets and tests)
    game.js             round state: typing, playing, revealed, done. No DOM
    timer.js            the 30 second timer. No DOM
    score.js            score, rank, result lines, missed concepts. No DOM
    links.js            challenge links and WhatsApp links. No DOM
    highlight.js        turns one code line into coloured spans
    theme.js            light and dark switch
    share.js            share sheet, WhatsApp, copy link
    shareImage.js       draws share images
    analytics.js        GA4 and Meta Pixel, listening to events
    demo.js             demo mode
    presenter.js        presenter mode (nice to have)
    selftest.js         runs with ?test=1
    screens/
      home.js
      play.js           code card, picking, timer ring, reveal
      result.js
    fx/
      typing.js         the AI typing effect
      hero.js           the home screen editor animation
      ambient.js        floating code symbols in the background
      sound.js          Web Audio sounds and mute
      stamp.js          the CAUGHT stamp
  README.md
  UPGRADE_GUIDE.md
  CHANGELOG.md
  STUDENT_EXPLAINER.md
  REEL_SCRIPT.md
```

- **One animation loop.** A single `requestAnimationFrame` loop drives canvas and timer drawing. Use delta time, capped at 0.05 s, so speed is the same on 60Hz and 120Hz screens. CSS animations are fine for simple UI motion.
- **Hidden tab.** Pause the loop, the game timer and the ambient animation when the tab is hidden (`visibilitychange`).
- **Sharp canvases.** Size canvases to their CSS size times `devicePixelRatio`, capped at 2.
- **Resize and rotation.** Debounce by 150 ms and re-fit the code card. Never restart the timer or the typing.
- Add a `.gitignore` with `node_modules/`, `.DS_Store` and `Thumbs.db`.

---

## 5. config.js

`config.js` is already in the folder. Keep its structure and comments. You may change only:
- `salesWhatsApp`, when I give you the number
- `siteUrl`, in Phase 6

What each setting does:
- `roundSize` (8) and `secondsPerSnippet` (30): the game. Nothing else may hard-code 8 or 30.
- `packsOnHome`: which packs show as mode cards, in order.
- `courseName`: used in the CTA card and the WhatsApp message.
- `salesWhatsApp`: digits only, country code first, 11 to 15 digits. If empty or not in that format, hide the WhatsApp sales button and show "See the program" instead.
- `website` and `utm`: build every link to wrench-wise.com, adding `utm_content` (`home`, `result` or `footer`) so we can tell the buttons apart.
- `session`: when `enabled` is true, show the free session card on home and result screens.
- `analytics`: an empty ID switches that tracker off.
- `features`: switches. Every optional feature checks its switch.

---

## 6. Features

### Must have

**A. Home screen**
- **Background:** `--bg-grad`, with 14 faint code symbols (`{ }`, `( )`, `;`, `=>`, `[ ]`, `</>`) drifting slowly up and fading. 14 to 20px, `--brand` at 10% opacity, 12 to 20 second loops, `transform` and `opacity` only.
- **Hero editor:** a dark editor card (`--code-bg`) with a title bar of three small grey dots and the file name "ai-wrote-this.js". On laptop it is tilted in 3D (rotateX 8deg, rotateY -12deg) and follows the pointer by up to 6 degrees. Flat on phone. It loops through b01, d07 and b03, about 7 seconds each:
  1. The code types itself with a blinking cursor (25 ms per character, at most 1.6 s).
  2. A thin scan line (2px, brand gradient, soft glow) sweeps from top to bottom in 0.9 s.
  3. The bug line flashes red (`--bug-bg`) with a 2-frame glitch: red and cyan copies of the line shifted 2px sideways.
  4. A "CAUGHT" stamp lands near the line: scale 1.4 to 1, rotated -8deg, 200 ms. It never bounces more than once.
  5. Hold 1.2 s, fade out, next snippet.
- **Text:** eyebrow chip "30 seconds a snippet". Title "Catch the AI" in weight 800 with the brand gradient as text fill (solid `--brand` if gradient text is not supported). Subtitle from copy.js.
- **Mode cards:** one card button per pack in `packsOnHome`, showing the pack name, its tagline and "Best: 6/8" if a best score is saved. Tapping one starts a round.
- **How to play:** three small steps with inline SVG icons: "Read what the code should do", "Tap the line with the mistake", "See what AI got wrong".
- **About these snippets** (a `<details>`): "These are the kinds of mistakes AI coding tools really make. Each snippet was written and checked by the Wrench Wise team."
- **Session card**, if `config.session.enabled` (Section 6F).
- **Challenge banner**, if the page was opened from a valid challenge link (Section 6G). It sits above the mode cards.
- **Layout:** on phone, stacked: header, hero, title, subtitle, mode cards, how to play, about, footer. At 390 x 844 the title, subtitle and both mode cards are visible without scrolling. On laptop, two columns: text and cards on the left, a larger hero on the right.

**B. Building a round** (`content.js`, no DOM)
- `buildRound(packId, rng)`: shuffle the pack's active (not retired) challenges with `rng`, take `roundSize`, then order them by level, keeping the shuffled order within each level. Easy ones come first.
- `getChallenge(id)` finds any challenge by id, including retired ones.
- `dailySet(packId, yyyymmdd)`: shuffle active ids with `seededShuffle(ids, yyyymmdd)`, take `roundSize`, order by level the same way. Used by Daily 8 and the self-test.
- `rng.js` uses the mulberry32 algorithm. `seededShuffle` is a Fisher-Yates shuffle from the last index down to 1, picking `j = floor(rng() * (i + 1))`. The self-test locks the exact output (Section 10).
- New rounds from the home screen use `Math.random`.

**C. The play screen** (`screens/play.js`)
- **Top bar:** "Snippet 3 of 8", then 8 progress dots: grey for ahead, a pulsing ring for the current one, `--success` for caught, `--error` for missed. On the right, the timer ring (56px).
- **Timer ring:** an SVG circle whose stroke uses the brand gradient and shrinks as time runs out. The whole seconds left (rounded up) sit in the centre in tabular numbers. In the last 5 seconds the ring turns `--timer-warn`, the number gives one small pulse per second (scale 1 to 1.08), and a tick sound plays.
- **Task card:** a small label "The task", then the challenge's `task` text in 16px weight 600.
- **Code card:** a dark editor (`--code-bg`, 16px radius, `--shadow-xl`).
  - Title bar: three grey dots, the file name (the function name plus `.js`, for example `finalPrice.js`), and a small chip "AI wrote this" with a sparkle icon.
  - Each line: a line number gutter in `--code-muted`, then the code in the mono font, coloured by `highlight.js`.
  - **Line notes:** if the challenge has `notes` and `features.lineNotes` is on, each line shows its note underneath in 12px `--code-muted`. A toggle in the title bar ("Line notes: On" or "Off") hides them. Notes start on in Beginner mode. Packs without notes show no toggle.
  - **Auto-fit:** pick the largest whole font size from 11px up to 15px on phone (16px on laptop) at which the longest line, including the challenge's `fix` line, fits the code area. Measure with a canvas `measureText` using the real mono font. Lines never wrap and the card never scrolls sideways (`white-space: pre`).
  - **Picking:** the lines sit in a `role="radiogroup"` labelled "Code lines. Pick the line with the mistake." Each line is a full-width `role="radio"` row, at least 34px tall (44px with notes). Tapping a line selects it: `--code-select` background and a 3px `--code-select-bar` on the left. Tapping another line moves the selection. Every line can be picked, including blank lines and lone braces, so nothing gives the answer away.
  - **Confirm button** (primary, full width on phone): "Tap the line with the mistake" while nothing is picked (disabled), then "Line 3 is the mistake". Tapping it locks the answer. The separate confirm step stops mis-taps on small screens.
- **AI typing** (`fx/typing.js`): before the timer starts, the code types itself with a blinking cursor in `--accent`. 18 ms per character, with the speed raised so the whole snippet takes at most 1.6 s. A shimmering label "AI is writing code" shows during typing, then changes to "Find the mistake" and the timer starts. Tapping the card during typing finishes it at once. Lines cannot be picked while typing. Send `snippet:typed` when it finishes.
- **Timer** (`timer.js`): uses `performance.now()` differences, never a counter of setInterval ticks. It pauses while the tab is hidden. It takes a clock function so the self-test can fake time. Remaining time = `secondsPerSnippet` minus active (unpaused) time. Expired when remaining is 0 or less. The recorded answer time is active seconds rounded to 1 decimal.
- **Keyboard on laptop:** Up and Down move the selection, Enter locks it, N or Right Arrow goes to the next snippet after the reveal, M mutes.

**D. The reveal**

When the player locks a line or time runs out, input locks and the reveal plays:
1. **Caught:** the line flashes `--fix-bg`, the CAUGHT stamp lands at the right end of the line, a chime plays and the progress dot turns `--success`.
2. **Wrong line:** the picked line gets a grey outline and a small "Your pick" tag. The real bug line glows `--bug-bg` with the 2-frame glitch. A soft thud plays. The dot turns `--error`.
3. **Time's up:** a "Time's up" chip. The bug line glows red. Soft thud. The dot turns `--error`.
4. **The fix:** the bug line gets a strike-through and a "-" in the gutter. The `fix` line slides in directly below it with `--fix-bg`, `--fix-text` and a "+" in the gutter. Re-check the auto-fit with the extra line. Scroll the code card so both lines are visible.
5. **The reveal panel:** a bottom sheet on phone, a side panel on laptop. It holds:
   - The heading: "Caught it", "This one got past you" or "Time's up".
   - A "Run it" console in the mono font on `--code-bg`, typing in 3 lines: `> finalPrice(1000, 10)`, then "Should give" and the `expected` value, then "AI's code" and the `aiGot` value in `--bug-text`. Show the strings from the content file exactly as written.
   - The `why` text in 16px.
   - The `concept` as a small chip.
   - A button: "Next snippet", or "See my score" on the last one.
6. There is no auto-advance, so people can read. (Demo mode is the exception.)

**E. The result screen** (`screens/result.js`)
1. "You caught", then the score counting up over 0.8 s, then "of 8", all large.
2. A tally of 8 dots appears one by one, 80 ms apart: `--success` for caught, `--error` for missed. On laptop, each dot shows its challenge title on hover.
3. The rank badge lands like the stamp, using `rank(score, total)` (Section 10).
4. The result line from `resultLine(score, total)`, then "AI writes code fast. Checking it still takes someone who knows the basics."
5. "Average catch time: 8.7 s", averaged over caught snippets only. Hidden if none were caught.
6. If the round came from a challenge link with `beat`, the head-to-head line (Section 10).
7. "What tripped you up": up to 4 concept chips from missed snippets, unique, in the order played. Hidden on a perfect score.
8. "See all 8 again" (a `<details>`): each challenge's title, caught or missed, and its `why`.
9. Best score: save the best per pack in `cta-best` as JSON, for example `{"b":6,"d":4}`. Show a "New best" chip when it is beaten. Never save in demo or presenter mode.
10. The CTA card (6F), the session card if on (6F), the share card (6H).
11. Buttons: "Play again" (a new round, same pack) and "Try Developer mode" or "Try Beginner mode".

**F. Calls to action** (this is why the app exists)
- **CTA card:** title "Want to catch these every time?", body "The {course} covers the basics behind these mistakes, like loops, conditions, hash maps and sorting."
  - Primary button "Talk to us on WhatsApp": opens the sales link from `salesUrl()` in a new tab. Only shown when `salesWhatsApp` is valid.
  - Otherwise the primary button is "See the program", linking to the website with UTM (`utm_content=result`).
  - A text link "Visit wrench-wise.com" (UTM, `utm_content=result`).
- **The sales message** is built only by `links.js` (Section 10 has the exact text):
  "Hi, I just played Catch the AI on Beginner mode and caught 6 of 8 mistakes. I'd like to know more about the Certification Program in AI-Powered Software Engineering & DSA."
- **Session card** (when `session.enabled`): label "Free live session", the session title, the `when` text, and a button "Save my seat" opening `session.url` in a new tab.

**G. Challenge links** (`links.js`)
- **Making one:** `challengeLink(origin, ids, score)` = origin + `/?set=` + the ids joined with dots + `&beat=` + score. Origin is `config.siteUrl`, or `location.origin` while that is empty.
- **Reading one:** `readChallenge(search)` returns `{ packId, ids, beat }` or `null`. Valid only if:
  - `set` has 3 to 20 ids, all lowercase, all unique, all from the same pack, and every id exists (retired ids are fine).
  - `beat` is absent, or a whole number from 0 to the number of ids. If `beat` is present but invalid, the whole link is invalid.
- **Opening a valid link:** the home screen shows a banner above the mode cards:
  - with `beat`: "A friend caught 6 of 8 in Beginner mode. Can you beat that?"
  - without `beat`: "Someone sent you a set of 8 snippets in Beginner mode."
  - Button "Take the challenge" plays exactly that set, in that order.
- **Invalid links** are ignored quietly. No error message.
- After reading the link, remove the query from the address bar with `history.replaceState`, and keep the parsed challenge in memory.
- Respect `features.challengeLinks`.

**H. Sharing** (`share.js`, `shareImage.js`)
- Share card on the result screen, titled "Challenge a friend", with three buttons:
  - "Share my score": makes the share image and opens the phone share sheet with the image and the share text when `navigator.canShare({ files })` is true. Otherwise it downloads the PNG as `catch-the-ai-6-of-8.png`.
  - "Send on WhatsApp": opens `https://wa.me/?text=` plus the encoded share text.
  - "Copy challenge link": copies the challenge link. Changes to "Copied" for 2 seconds. Use `navigator.clipboard.writeText` with a hidden textarea fallback.
- Two size pills above the buttons: "Status" (1080 x 1920, selected by default) and "Post" (1080 x 1350).
- If the person cancels the share sheet, ignore the error quietly.
- **The share image**, drawn on a hidden canvas:
  - `--bg-grad` background, a 6px brand gradient bar at the top, the logo top left.
  - "Catch the AI" in weight 800.
  - The score huge, like "6/8", with the 6 in the brand gradient, and "mistakes caught" under it.
  - The pack name chip and the rank badge.
  - A small drawn editor card with 4 code lines from the last caught challenge (b01 if none), its bug line in red and a CAUGHT stamp.
  - "AI wrote 8 pieces of code. I caught 6."
  - Footer: "Can you beat me?" ("Can you match that?" on a perfect score) and the site address.
  - Status size uses the extra height for a larger editor card. Nothing important within 220px of the top or bottom edge, where Status bars cover it.

**I. Sound** (`fx/sound.js`)
- Web Audio only, synthesised in code. No sound files.
- Create the AudioContext on the first tap.
- Sounds:
  - Key tick while typing: very quiet, an 8 ms click with random pitch, at most one every 40 ms
  - Timer tick: once a second in the last 5 seconds
  - Catch: two rising sine notes, 523 Hz then 784 Hz, 120 ms each
  - Miss: one soft 160 Hz triangle note, 180 ms
  - Result: a short three-note arpeggio, plus a brief sparkle on a perfect score
- Master volume 0.25.
- A speaker button in the header mutes and unmutes. Save the choice as `cta-muted`. Respect `features.sound`.

**J. Branding**
- **Header:** the logo (`assets/logo.png`, 28px tall), a thin divider, then "Catch the AI" in weight 800. On the right: the mute button and the theme button. A 3px brand gradient bar runs under the header. If the logo file is missing, use a clean text wordmark "Wrench Wise".
- **Footer**, small and quiet: "Built with code by Wrench Wise", a link "Learn to build apps like this" (website with UTM, `utm_content=footer`) and the version, like "v1.0.0".

**K. Layout**
- **Phone portrait first** (360 to 430px wide).
- **The reel frame:** at 390 x 844, on the play screen, the top bar, the task card, the whole code card and the confirm button fit on one screen without scrolling, for every one of the 20 challenges. The tallest are b07 (with notes) and d09.
- The reveal sheet may cover the lower part of the screen, but the bug line and the fix line must stay visible above it.
- **Laptop (900px and wider):** on the play screen, two columns: the code card on the left (max 640px), and the task, timer, confirm button and reveal panel on the right. Max content width 1100px.
- **General:**
  - Use `100dvh` so mobile browser bars do not cut the layout.
  - Respect notches and the home bar with `env(safe-area-inset-*)`.
  - Touch targets at least 44px, except code line rows (at least 34px, full width, with a separate confirm button).
  - No horizontal scrolling at any width from 360px up.

**L. Demo mode** (for recording reels)
- Opens with `?demo=1`. Options: `&mode=b` or `&mode=d` (default b), `&n=3` to `&n=8` (how many snippets, default 8), `&theme=light` or `&theme=dark`.
- Fixed sets, played in this order:
  - b: b01, b03, b02, b05, b07, b08, b09, b10
  - d: d01, d07, d03, d05, d02, d08, d04, d09
- A visible tap dot (a 28px translucent circle) does everything:
  1. On home, it presses the mode card.
  2. On each snippet, the typing plays. After 2.5 s it moves to a line and taps, then taps the confirm button 0.6 s later.
  3. It picks the bug line, except on snippets 3 and 6, where it picks the line just above the bug line, so the reel shows a miss. With n = 8 the score is 6.
  4. The reveal holds 3.5 s, then it taps "Next snippet".
  5. The result holds 4 s, smooth-scrolls to the CTA card, holds 3 s, scrolls back up and starts again.
- The timer ring runs for real (only a few seconds pass).
- Demo mode never sends analytics, never saves scores and never changes the address bar.
- It must look clean in vertical (9:16 phone) and horizontal (16:9 laptop).

**M. Analytics** (`analytics.js`, listening to events only)
- Load only when the ID is set in `config.js`. Never with `?test=1` or `?demo=1`.
- **GA4.** Set `page_location` to the page address without the query. Events:

| GA4 event | Parameters |
|---|---|
| `game_start` | `pack`, `source` |
| `snippet_answer` | `pack`, `challenge_id`, `result`, `seconds` |
| `game_complete` | `pack`, `score`, `total` |
| `whatsapp_sales_click` | `pack`, `score` |
| `website_click` | `spot` |
| `session_click` | none |
| `share_image` | `size` |
| `share_whatsapp` | none |
| `copy_link` | none |
| `challenge_link_open` | `pack`, `has_beat` |

- **Meta Pixel.** `PageView` on load. The standard `Lead` event on the WhatsApp sales click. Custom events `GameStart` (`pack`) and `GameComplete` (`pack`, `score`).
- Send nothing else.
- `snippet_answer` matters: it shows which challenges are too easy or too hard, so we can improve the content (see `UPGRADE_GUIDE.md`).

### Nice to have (only if time allows, in this order)
1. **Presenter mode** (`?present=1`, `features.presenterMode`), for our free live sessions on Zoom or Meet:
   - The code font is at least 20px, and the layout suits a shared laptop screen.
   - The timer starts paused. T starts or pauses it.
   - Keys 1 to 9 pick a line (Up and Down also work, for longer snippets), Enter locks it, R reveals the answer without a pick, Right Arrow goes to the next snippet.
   - Hide the WhatsApp CTA and share card. The result screen says "Questions? Ask in the chat."
   - No analytics events and no saved scores.
2. **Daily 8** (`features.dailyEight`, off for now): a "Today's 8" card on home that plays `dailySet(packId, today)`, where today is the India date (UTC+5:30) as a number like 20261027. Everyone gets the same set that day. The function and its test are built in Phase 1 anyway. Only build the card. We will switch it on when each pack has 30 or more challenges.
3. **Installable app:** `manifest.json` with app icons, so it can be added to the home screen.

---

## 7. Visual style: matched to wrench-wise.com

These values were measured from the live wrench-wise.com site: emerald as the main brand colour, teal and cyan as accents, gray text, white cards and soft emerald-to-cyan gradients. The editor colours are added for this app.

**Colours.** Every colour is a CSS variable in `styles/tokens.css`. JavaScript reads them with `getComputedStyle`. First visit follows the device's light or dark setting. The theme button switches it and saves `cta-theme`.

**Site tokens**

| Token | Light (default) | Dark |
|---|---|---|
| `--bg` | `#FFFFFF` | `#0F172A` |
| `--bg-grad` | `linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 45%, #ECFEFF 100%)` | `linear-gradient(135deg, #0F172A 0%, #1E293B 100%)` |
| `--surface` | `#FFFFFF` | `#1E293B` |
| `--surface-2` | `#F3F4F6` | `#334155` |
| `--border` | `#E5E7EB` | `#334155` |
| `--text` | `#111827` | `#F1F5F9` |
| `--text-2` | `#374151` | `#CBD5E1` |
| `--muted` | `#6B7280` | `#94A3B8` |
| `--brand` | `#059669` | `#10B981` |
| `--brand-strong` | `#047857` | `#34D399` |
| `--brand-soft` | `#D1FAE5` | `rgba(16,185,129,0.15)` |
| `--accent` | `#0891B2` | `#22D3EE` |
| `--success` | `#059669` | `#34D399` |
| `--error` | `#E11D48` | `#FB7185` |
| `--timer-track` | `#E5E7EB` | `#334155` |
| `--timer-warn` | `#E11D48` | `#FB7185` |

**Editor tokens** (the code card is dark in both themes, like a real editor)

| Token | Light (default) | Dark |
|---|---|---|
| `--code-bg` | `#0F172A` | `#020617` |
| `--code-bar` | `#1E293B` | `#0F172A` |
| `--code-border` | `#1E293B` | `#334155` |
| `--code-text` | `#E2E8F0` | `#E2E8F0` |
| `--code-muted` | `#94A3B8` | `#94A3B8` |
| `--code-hover` | `rgba(148,163,184,0.10)` | `rgba(148,163,184,0.10)` |
| `--code-select` | `rgba(6,182,212,0.20)` | `rgba(34,211,238,0.20)` |
| `--code-select-bar` | `#22D3EE` | `#22D3EE` |
| `--syn-keyword` | `#34D399` | `#34D399` |
| `--syn-string` | `#67E8F9` | `#67E8F9` |
| `--syn-number` | `#FCD34D` | `#FCD34D` |
| `--syn-func` | `#A7F3D0` | `#A7F3D0` |
| `--syn-punct` | `#CBD5E1` | `#CBD5E1` |
| `--bug-bg` | `rgba(244,63,94,0.22)` | `rgba(244,63,94,0.26)` |
| `--bug-text` | `#FDA4AF` | `#FDA4AF` |
| `--fix-bg` | `rgba(16,185,129,0.22)` | `rgba(16,185,129,0.26)` |
| `--fix-text` | `#6EE7B7` | `#6EE7B7` |

**Brand gradient:** `--brand-grad: linear-gradient(90deg, #059669, #0D9488, #06B6D4)`. Use it for the primary button, the bar under the header, the title text, the timer ring and the share image bar.

**Syntax colours** (`highlight.js`, one line at a time):
- Keywords in `--syn-keyword`: function, return, let, const, var, if, else, for, while, of, in, new, true, false, null, undefined, break, continue
- Text in quotes in `--syn-string`
- Numbers in `--syn-number`
- A name followed by `(` in `--syn-func`
- Brackets, braces, operators and punctuation in `--syn-punct`
- Everything else in `--code-text`

**Fonts**
- Text: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` (the site's own stack). Headings weight 800 with letter spacing -0.01em. Body weight 400 to 500.
- Code: `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", "Courier New", monospace`.
- All numbers use `font-variant-numeric: tabular-nums` so they do not jump while counting.

**Shapes:** buttons and pills fully rounded (999px). Cards and the code card 16px. Chips and the stamp 8px.

**Shadows** (light theme; in dark use the same shapes with `rgba(0,0,0,0.40)`)
- `--shadow-sm: 0 1px 3px rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)`
- `--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)`
- `--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)`
- `--shadow-xl: 0 20px 40px -12px rgba(15,23,42,0.35)`

**Meta:** `theme-color` meta tag `#FFFFFF` (light) and `#0F172A` (dark) using media queries. In `manifest.json`: `theme_color` `#059669`, `background_color` `#FFFFFF`.

**Contrast:** all text at least 4.5 to 1 against its background. Check with DevTools.

**Motion rules**
- UI animates only `transform` and `opacity`. Never width, height, top, left or margins.
- Easing: `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)` and `--ease: cubic-bezier(0.4, 0, 0.2, 1)` (the site's own curve). Durations 150, 200, 300 and 500 ms.
- Professional and calm. Small distances. Nothing bounces more than once.
- **Reduced motion** (`prefers-reduced-motion: reduce`):
  - Code appears at once, with no typing.
  - The hero shows its final caught state, still, with no tilt, scan or glitch.
  - Stamps appear without scaling. Numbers show without counting.
  - No ambient symbols. The timer number does not pulse.
  - Fades are under 150 ms. Sounds still play unless muted.

---

## 8. Words (copy.js)

Use exactly these. Values in braces are filled by `t()`. `{course}` is always `config.courseName`.

| Key | Text |
|---|---|
| `home.eyebrow` | 30 seconds a snippet |
| `home.title` | Catch the AI |
| `home.subtitle` | AI wrote {total} pieces of code. Each one has a hidden mistake. How many can you catch? |
| `home.best` | Best: {score}/{total} |
| `home.how1` / `how2` / `how3` | Read what the code should do / Tap the line with the mistake / See what AI got wrong |
| `home.aboutTitle` | About these snippets |
| `home.aboutBody` | These are the kinds of mistakes AI coding tools really make. Each snippet was written and checked by the Wrench Wise team. |
| `home.challengeBeat` | A friend caught {beat} of {total} in {mode} mode. Can you beat that? |
| `home.challengeSet` | Someone sent you a set of {total} snippets in {mode} mode. |
| `home.challengeBtn` | Take the challenge |
| `play.counter` | Snippet {n} of {total} |
| `play.taskLabel` | The task |
| `play.writing` | AI is writing code |
| `play.find` | Find the mistake |
| `play.aiChip` | AI wrote this |
| `play.notesOn` / `notesOff` | Line notes: On / Line notes: Off |
| `play.pick` | Tap the line with the mistake |
| `play.confirm` | Line {line} is the mistake |
| `play.linesLabel` | Code lines. Pick the line with the mistake. |
| `reveal.caught` | Caught it |
| `reveal.wrong` | This one got past you |
| `reveal.timeout` | Time's up |
| `reveal.yourPick` | Your pick |
| `reveal.stamp` | CAUGHT |
| `reveal.run` | Run it |
| `reveal.should` | Should give |
| `reveal.got` | AI's code |
| `reveal.next` | Next snippet |
| `reveal.last` | See my score |
| `result.youCaught` | You caught |
| `result.of` | of {total} |
| `result.support` | AI writes code fast. Checking it still takes someone who knows the basics. |
| `result.avg` | Average catch time: {seconds} s |
| `result.newBest` | New best |
| `result.tripped` | What tripped you up |
| `result.review` | See all {total} again |
| `result.again` | Play again |
| `result.switch` | Try {mode} mode |
| `cta.title` | Want to catch these every time? |
| `cta.body` | The {course} covers the basics behind these mistakes, like loops, conditions, hash maps and sorting. |
| `cta.whatsapp` | Talk to us on WhatsApp |
| `cta.program` | See the program |
| `cta.website` | Visit wrench-wise.com |
| `session.label` | Free live session |
| `session.btn` | Save my seat |
| `share.title` | Challenge a friend |
| `share.image` | Share my score |
| `share.whatsapp` | Send on WhatsApp |
| `share.copy` | Copy challenge link |
| `share.copied` | Copied |
| `share.status` / `share.post` | Status / Post |
| `share.imageLine` | AI wrote {total} pieces of code. I caught {score}. |
| `share.imageBeat` / `share.imageMatch` | Can you beat me? / Can you match that? |
| `presenter.end` | Questions? Ask in the chat. |
| `footer.built` | Built with code by Wrench Wise |
| `footer.learn` | Learn to build apps like this |

The rank names, result lines, head-to-head lines, sales message and share text are in Section 10. Put them in copy.js too, and build them only through `score.js` and `links.js`.

---

## 9. Link preview (the WhatsApp card)

- **In `index.html`:**
  - Title: "Catch the AI by Wrench Wise"
  - Description: "AI wrote 8 pieces of code. Each has a hidden mistake. How many can you catch in 30 seconds each?"
  - Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type` (website), plus `twitter:card` set to `summary_large_image`.
- **`og:image` and `og:url`** must be full addresses. Use a placeholder until Phase 6, then set the real live address.
- **The preview image:**
  - If I have put my own `assets/og-image.png` in the folder, use it.
  - Otherwise, build `tools/og.html` at 1200 x 630: `--bg-grad` background, the hero editor card showing b01 with its bug line red and the CAUGHT stamp, the words "Catch the AI" in weight 800, and the logo.
  - Open it in Chrome at exactly that size, save a screenshot as `assets/og-image.png`, and keep it under 300 KB.

---

## 10. Correctness checks (must pass)

### 1. Content check

`node tools/verify-content.mjs` must end with `RESULT: ALL PASS` and report 20 challenges. It already passes. It runs every challenge's AI code and fixed code in Node, so the mistake shown in the app is proven real.

### 2. Self-test

When the URL has `?test=1`, run `selftest.js` and show a clear PASS or FAIL table on the page and in the console, with the version at the top. Every value below must match exactly. They were worked out twice, in JavaScript and in Python, and both agree.

**a. Content loading**
- Packs `b` and `d` load with 10 active challenges each, 20 in total, all ids unique.
- Every `bugLine` points at a real line. Every `notes` list has one entry per line.

**b. Rounds.** Run `buildRound` 200 times per pack:
- Always 8 challenges, all unique, all from that pack, none retired.
- Levels never go down within a round.
- Then, using a test copy of pack b where b01 is marked retired: b01 never appears in 200 rounds, but `readChallenge` still accepts a link containing b01.

**c. Ranks**

| Score of 8 | Rank |
|---|---|
| 0, 1, 2 | Fresh Eyes |
| 3, 4 | Getting Sharp |
| 5, 6 | Sharp Reviewer |
| 7 | Bug Hunter |
| 8 | AI's Toughest Reviewer |

The rule is a percentage: all correct is "AI's Toughest Reviewer", 85% or more "Bug Hunter", 60% or more "Sharp Reviewer", 35% or more "Getting Sharp", otherwise "Fresh Eyes". So it still works if the round size changes. Also test out of 10:

| Score of 10 | Rank |
|---|---|
| 0, 1, 2, 3 | Fresh Eyes |
| 4, 5 | Getting Sharp |
| 6, 7, 8 | Sharp Reviewer |
| 9 | Bug Hunter |
| 10 | AI's Toughest Reviewer |

**d. Result lines** (out of 8)

| Score | Line |
|---|---|
| 0 | AI wrote all 8. This time, every mistake got past you. |
| 1 | AI wrote all 8. You caught 1. |
| 6 | AI wrote all 8. You caught 6. |
| 8 | AI wrote all 8. You caught every one. |

**e. Head-to-head lines**

| You | Friend | Line |
|---|---|---|
| 7 | 6 | You caught 7. Your friend caught 6. You win this one. |
| 6 | 6 | You both caught 6. It's a tie. |
| 5 | 6 | Your friend caught 6. You caught 5. Rematch? |

**f. Challenge links**

`challengeLink("https://catch-the-ai.vercel.app", ["b01","b02","b03","b04","b05","b06","b07","b08"], 6)` gives exactly:

```
https://catch-the-ai.vercel.app/?set=b01.b02.b03.b04.b05.b06.b07.b08&beat=6
```

`readChallenge` results:

| Query | Result |
|---|---|
| `?set=b01.b02.b03.b04.b05.b06.b07.b08&beat=6` | valid: pack b, those 8 ids in that order, beat 6 |
| `?set=d10.d01.d02.d03.d04.d05.d06.d07&beat=0` | valid: pack d, beat 0 |
| `?set=b01.b02.b03.b04.b05.b06.b07.b08` | valid: pack b, no beat |
| `?set=b01.b02.b03&beat=2` | valid: pack b, 3 ids, beat 2 |
| `?set=b01.b02&beat=1` | invalid (fewer than 3) |
| `?set=b01.b02.b03.b04.b05.b06.b07.d08&beat=3` | invalid (two packs) |
| `?set=b01.b01.b03.b04.b05.b06.b07.b08&beat=3` | invalid (repeated id) |
| `?set=b01.b02.b03.b04.b05.b06.b07.x99&beat=3` | invalid (unknown id) |
| `?set=B01.B02.B03.B04.B05.B06.B07.B08&beat=3` | invalid (capitals) |
| `?set=b01.b02.b03.b04.b05.b06.b07.b08&beat=9` | invalid (beat above 8) |
| `?set=b01.b02.b03.b04.b05.b06.b07.b08&beat=abc` | invalid (beat not a number) |
| (no query) | null |

**g. WhatsApp sales link.** With the test number `910000000000` (test only, never in config), `salesUrl("910000000000", "Beginner", 6, 8)` gives exactly:

```
https://wa.me/910000000000?text=Hi%2C%20I%20just%20played%20Catch%20the%20AI%20on%20Beginner%20mode%20and%20caught%206%20of%208%20mistakes.%20I'd%20like%20to%20know%20more%20about%20the%20Certification%20Program%20in%20AI-Powered%20Software%20Engineering%20%26%20DSA.
```

and `salesUrl("910000000000", "Developer", 8, 8)` gives exactly:

```
https://wa.me/910000000000?text=Hi%2C%20I%20just%20played%20Catch%20the%20AI%20on%20Developer%20mode%20and%20caught%208%20of%208%20mistakes.%20I'd%20like%20to%20know%20more%20about%20the%20Certification%20Program%20in%20AI-Powered%20Software%20Engineering%20%26%20DSA.
```

Also: if `config.salesWhatsApp` is not empty, it must be 11 to 15 digits only.

**h. Share text.** For score 6 of 8 with the link from (f):

```
AI wrote 8 pieces of code, each with a hidden mistake. I caught 6. Can you beat me? https://catch-the-ai.vercel.app/?set=b01.b02.b03.b04.b05.b06.b07.b08&beat=6
```

For a perfect score the middle changes to "I caught all 8. Can you match that?". The WhatsApp share link for the score 6 text is exactly:

```
https://wa.me/?text=AI%20wrote%208%20pieces%20of%20code%2C%20each%20with%20a%20hidden%20mistake.%20I%20caught%206.%20Can%20you%20beat%20me%3F%20https%3A%2F%2Fcatch-the-ai.vercel.app%2F%3Fset%3Db01.b02.b03.b04.b05.b06.b07.b08%26beat%3D6
```

**i. Missed concepts**
- Round b01 to b08, caught = [yes, no, yes, no, yes, no, no, yes] gives: `["Using the right value", "Order of values", "Loop limits"]`
- Round d01 to d08, all missed, gives the first 4 unique: `["Starting values", "Loop limits", "Made-up methods", "Two pointers"]`
- A perfect round gives an empty list.

**j. Average catch time.** Caught times [4.2, 9.9, 12.0] give "8.7". No catches gives no line.

**k. Timer** (fake clock, 30 seconds, started at 0)

| Clock (s) | Seconds shown | Warning | Expired |
|---|---|---|---|
| 0 | 30 | no | no |
| 0.001 | 30 | no | no |
| 1.0 | 29 | no | no |
| 24.999 | 6 | no | no |
| 25.0 | 5 | yes | no |
| 29.999 | 1 | yes | no |
| 30.0 | 0 | yes | yes |

Seconds shown = remaining time rounded up. Warning when 5 seconds or less remain.

With a pause from clock 10 to clock 15: at 34.999 it shows 1 and is not expired. At 35.0 it is expired. Locking an answer at clock 20 records 15.0 seconds. Without a pause, locking at clock 12.34 records 12.3.

**l. Seeded random**
- `mulberry32(42)`: the first three values, to 10 decimal places, are 0.6011037519, 0.4482905590 and 0.8524657935.
- `dailySet("b", 20261027)` = b03, b01, b04, b02, b09, b06, b07, b10
- `dailySet("d", 20261027)` = d03, d01, d07, d04, d02, d09, d06, d10
- `dailySet("b", 20261028)` = b05, b03, b02, b04, b09, b06, b07, b10

**m. Words**
- No text in copy.js contains a banned word from Rule 6, an emoji or a long dash.
- The CTA body and the sales message contain the full course name.

**n. Privacy and storage.** After a full round, `localStorage` holds no keys other than `cta-theme`, `cta-muted` and `cta-best`.

### 3. Other checks
1. **Console.** No console errors on any screen.
2. **Speed.** In Chrome DevTools at 390 x 844 with CPU throttling set to 4x: typing, reveal and result animations average above 50 fps, and the home hero above 45 fps. Report the numbers.
3. **Layout.** Screenshots at 360 x 740, 390 x 844, 768 x 1024 and 1440 x 900. No horizontal scroll anywhere.
4. **Fit check.** A temporary `?preview=all` steps through all 20 challenges at the current screen size and reports, for each, whether the code card and confirm button fit on screen. All must pass at 390 x 844.
5. **Brand match.** Open wrench-wise.com and the app side by side and screenshot both. Fix anything that does not look like the same company. Search the code for colour values and confirm every one comes from Section 7.
6. **Tone.** Search all user-facing text for the banned words in Rule 6. There must be none.
7. **Safety.** Search the code for `innerHTML`, `insertAdjacentHTML`, `eval(`, `new Function` and `onclick=`. None may appear.
8. **Contrast.** All text at least 4.5 to 1.
9. **Links.** Open one valid challenge link and two invalid ones from table (f). Report what happens.

---

## 11. Phases

Total target is about 7 hours. Take the time needed to get each phase right.

### Phase 0: Setup and content check (target 20 min)
- **Do:**
  - Run `node --version`, then `node tools/verify-content.mjs`.
  - `git init`, add `.gitignore`.
  - Create the folders from Section 4, `styles/tokens.css` with every token from Section 7, and an `index.html` shell with the header and footer.
  - Start the local server.
- **Report:** the Node version, the full content check table, and a screenshot of the shell page.

### Phase 1: Engine and self-test (target 60 min)
- **Build:** `events.js`, `copy.js` (every key from Section 8 and the lines from Section 10), `content.js`, `rng.js`, `game.js`, `timer.js`, `score.js`, `links.js` and `selftest.js` with checks a to n.
- **Report:** the full self-test table. Every value must match Section 10. Do not continue with a mismatch. Explain it in plain words instead.

### Phase 2: The code card (target 75 min)
- **Build:**
  - `highlight.js`, the code card with auto-fit, line notes, picking, the confirm button and keyboard support
  - The timer ring, progress dots and AI typing
  - A temporary `?preview=<id>` view that shows one challenge, and `?preview=all` for the fit check
- **Report:**
  - Screenshots of b07 and d09 at 390 x 844 and 1440 x 900
  - The fit table for all 20 challenges
  - The typing fps with 4x CPU throttling

### Phase 3: Home, game flow and results (target 90 min)
- **Build:**
  - `router.js` and the three screens
  - The home hero, ambient symbols, mode cards, how to play, about, and the session card
  - The full round loop and the reveal (stamp, glitch, diff, Run it console, why, concept)
  - The result screen (count-up, tally, rank stamp, lines, concepts, review list, best score)
  - The CTA card and sound
- **Report:**
  - Screenshots of home, typing, picked, caught, missed, time's up and result, on phone and laptop
  - Click steps for me to play a full round in Chrome

### Phase 4: Challenge links and sharing (target 60 min)
- **Build:**
  - Reading challenge links, the home banner and the head-to-head line
  - The share card, both share image sizes, WhatsApp share and copy link
  - Link preview tags and `og-image.png`
- **Report:** both share images for scores 6 and 8, the link test results from check 9, and a screenshot of the challenge banner.

### Phase 5: Polish (target 60 min)
- **Build:**
  - Dark theme and the theme button
  - Reduced motion
  - Demo mode
  - Analytics, wired to events
  - Accessibility: keyboard play, focus rings, `aria-live` announcements for "Caught it", "Time's up" and the final score
  - Remove the temporary `?preview` views
  - Then, only if time allows, the Nice to Have items in order
- **Report:**
  - Screenshots in both themes
  - Confirmation that demo mode loops cleanly with n = 3 and n = 8
  - The speed numbers and the brand match screenshots
  - Click steps for me to check analytics: GA4 DebugView, and the Meta Pixel Helper Chrome extension

### Phase 6: Docs and deploy (target 45 min)
- **README.md:**
  - What the app is and the live link
  - How to play in 3 steps
  - How to run it locally, and how to run the content check
  - "How it works" in 5 short points: the event bus, the timer using `performance.now`, auto-fit with `measureText`, links that carry ids, and the content check that runs every challenge
  - "Built by Wrench Wise"
- **UPGRADE_GUIDE.md**, in plain words for me, with these recipes:
  1. Change the WhatsApp number, course name, session card or links (`config.js` only)
  2. Add a new challenge: copy one, give it the next id, fill every field, run the content check, have an instructor read it
  3. Retire a challenge (`retired: true`, never delete)
  4. Add a new JavaScript pack (for example Full Stack): a new pack file, one line in `content/index.js`, one entry in `packsOnHome`
  5. Turn a feature on or off (`config.features`)
  6. Use GA4 to improve content: in `snippet_answer`, a challenge caught by over 90% of players is too easy, and one caught by under 15% is too hard or unclear
  7. Release steps: raise `config.version`, add a `CHANGELOG.md` entry, tag in git
  8. How to run any future upgrade with Antigravity, including this ready-to-paste prompt:
     > Read PROJECT_BRIEF.md, UPGRADE_GUIDE.md and CHANGELOG.md. I want to add: [describe the feature]. Create a branch called upgrade-[short-name]. Follow Section 3 of PROJECT_BRIEF.md. Plan the work in phases and stop after each one with a Phase Report. Do not change content/ unless I ask. Keep every self-test and the content check passing, and add tests for the new feature. Give me the Vercel preview link and wait. Merge only when I reply "Ship it".
  9. Upgrades this structure is ready for, and what each needs: Daily 8 (more challenges first), a Full Stack pack, Tamil text (`copy.ta.js` and a language switch), two-bug hard mode (a schema change), Java or Python packs (a checker that runs those languages), and a leaderboard (needs a backend, so it is a separate project)
- **CHANGELOG.md:** a "1.0.0" entry listing what v1 includes.
- **STUDENT_EXPLAINER.md:** for students:
  - What the game teaches
  - The 20 mistakes grouped by concept, with one line each
  - How the app is built, in plain words
  - 3 extension tasks: add a new challenge that passes the content check, add a "Hint" button that greys out half the wrong lines and costs 5 seconds, and add a daily streak counter
- **REEL_SCRIPT.md:** three scripts, each with a hook as on-screen text in the first 2 seconds, a shot list matched to demo mode timing, captions, optional voiceover lines and a closing line with Wrench Wise:
  - Vertical, 30 seconds (`?demo=1&n=3`)
  - Horizontal, 60 seconds (`?demo=1&n=8`, trimmed)
  - "Can you spot it?": one snippet, freeze before the reveal, "Comment the line number", with the answer in the next reel
  - No emojis, no em dashes, none of the banned words
- **Deploy:**
  1. Help me push the folder to GitHub. I will give you my empty repository URL.
  2. Deploy it on Vercel as a static site, with no build command.
  3. Set `config.siteUrl`, `og:url` and `og:image` to the live address, then redeploy.
  4. Give click-by-click steps for anything I must do myself.
  5. Confirm the live site works on a phone-sized screen, that `?test=1` passes live, and that one challenge link opens correctly.
  6. Tag the release `v1.0.0` and push the tag.
  7. Give me the live link, the demo links for both modes, and the presenter link.

---

## 12. Phase Report format

- **What I built** (3 to 5 bullets)
- **How to check it** (click steps)
- **Screenshots** (phone and laptop, where relevant)
- **Not working or cut,** explained in plain words
- **Time used** against the target

---

## 13. If something keeps breaking

- If the same bug survives two fix attempts, stop. Explain it in plain words and give me options. Do not keep looping.
- If I say "Park it", move that feature to a "Parked" list in the Phase Report and continue with the next phase.
- If I want to ship sooner, park in this order:
  1. Presenter mode and Daily 8
  2. The Post size share image (keep Status)
  3. The hero's 3D tilt and pointer follow (keep the typing, scan and stamp)
  4. The "See all 8 again" list
  5. The typing key-tick sound

**Never park:**
- The AI typing, the catch and miss reveal with the fix and the Run it console
- The result screen with the WhatsApp CTA
- Challenge links and the Status share image
- The content check, the self-test and every value in Section 10
- Every rule in Section 3
- The privacy, tone and safety rules
- Light and dark theme
- Demo mode
- Reduced motion rules
- Deployment
