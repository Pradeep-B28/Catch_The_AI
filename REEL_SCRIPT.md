# Social Media Reel & Video Scripts

These three scripts are designed for Instagram Reels, YouTube Shorts, LinkedIn, and TikTok. Each script is timed to match Demo Mode automated recordings.

Tone rules: No emojis, no long dashes, no marketing jargon.

---

## Script 1: Vertical 30-Second Reel (Instagram / YouTube Shorts / TikTok)

**Format:** 9:16 vertical video  
**Demo Mode URL:** `http://localhost:8000/?demo=1&n=3`  
**Duration:** 30 seconds  

### Shot List & Timing

- **00:00 - 00:02 | The Hook**
  - **Visual:** Phone viewport showing the Catch the AI home screen. The tap dot taps "Beginner Mode".
  - **On-Screen Text (Large, Bold):** AI wrote this code. Can you spot the bug in 30 seconds?
  - **Voiceover (Optional):** AI wrote this code in 2 seconds. Can you spot the bug before the timer runs out?

- **00:03 - 00:11 | Snippet 1 (Catch)**
  - **Visual:** AI types `hasDiscount.js`. Timer counts down from 30. Tap dot selects line 2 (`if (code = "SAVE10")`). Confirms answer. Green flash, CAUGHT stamp lands, chime audio plays.
  - **On-Screen Text:** Line 2: using single equals assigns instead of comparing.
  - **Voiceover (Optional):** Line 2 has an assignment operator instead of a comparison. That is a classic mistake.

- **00:12 - 00:20 | Snippet 2 (Miss & Fix Diff)**
  - **Visual:** Snippet 3 loads. AI types code. Tap dot picks line 2, but the real bug is line 3. Red glitch flash, soft thud. Fix line slides in with plus symbol in gutter.
  - **On-Screen Text:** AI missed the return statement. It compiled, but returned undefined.
  - **Voiceover (Optional):** It compiles fine, but returns undefined because of a missing return statement.

- **00:21 - 00:27 | Result Screen**
  - **Visual:** Score counts up to 2 of 3. Tally dots pop in. Rank badge lands: "Getting Sharp".
  - **On-Screen Text:** AI writes code fast. Checking it takes someone who knows the basics.
  - **Voiceover (Optional):** AI writes code fast. Checking it takes someone who understands the fundamentals.

- **00:28 - 00:30 | Call to Action**
  - **Visual:** Screen scrolls to the WhatsApp CTA card and Wrench Wise logo.
  - **On-Screen Text:** Play free at wrench-wise.com. Built by Wrench Wise.
  - **Voiceover (Optional):** Test your skills free at wrench-wise.com with Wrench Wise.

---

## Script 2: Horizontal 60-Second Video (LinkedIn / YouTube / X)

**Format:** 16:9 horizontal video  
**Demo Mode URL:** `http://localhost:8000/?demo=1&n=8`  
**Duration:** 60 seconds  

### Shot List & Timing

- **00:00 - 00:04 | The Hook**
  - **Visual:** Desktop viewport showing the two-column home layout with ambient symbols and clean editor. Tap dot clicks "Developer Mode".
  - **On-Screen Text:** 8 real mistakes AI coding tools make every day. How many can you catch?
  - **Voiceover (Optional):** AI coding assistants write clean syntax, but logic mistakes slip into production code daily. How many can you catch?

- **00:05 - 00:20 | Fast Snippet Showcase**
  - **Visual:** Rapid progression through snippets: `cloneUser.js` (shallow object copy), `delayedCount.js` (closure capture), and `exactPrice.js` (floating point math).
  - **On-Screen Text:**
    - Snippet 1: Object spread does not clone nested properties.
    - Snippet 2: Shared loop variable capture.
    - Snippet 3: Floating point rounding: 0.1 + 0.2 does not equal 0.3.
  - **Voiceover (Optional):** From shallow copying object references to floating point rounding bugs, these mistakes compile cleanly but break in production.

- **00:21 - 00:40 | The Reveal & Run It Console**
  - **Visual:** Close-up on the "Run it" console and fix diff. Expected output vs AI's actual output.
  - **On-Screen Text:** The "Run it" console proves the bug with live execution output.
  - **Voiceover (Optional):** Every challenge in Catch the AI runs through a live Node test harness so the bug is proven real.

- **00:41 - 00:52 | Results & Tally**
  - **Visual:** Score counts up to 6 of 8. Rank badge "Sharp Reviewer" lands. Average catch time shows 8.7 seconds.
  - **On-Screen Text:** You caught 6 of 8. Rank: Sharp Reviewer. Average catch time: 8.7 seconds.
  - **Voiceover (Optional):** You caught 6 of 8 mistakes. That earns you the Sharp Reviewer badge.

- **00:53 - 01:00 | Call to Action**
  - **Visual:** Challenge card showing WhatsApp button and shareable status cards.
  - **On-Screen Text:** Master modern software engineering and DSA. Learn to build apps like this with Wrench Wise.
  - **Voiceover (Optional):** Master software engineering and data structures. Start your journey with Wrench Wise today.

---

## Script 3: "Can You Spot It?" Single Snippet Challenge

**Format:** 9:16 vertical video  
**Duration:** 15 seconds  

### Shot List & Timing

- **00:00 - 00:03 | The Hook**
  - **Visual:** Snippet `hasDiscount.js` displays.
  - **On-Screen Text (Centered, Bold):** Can you find the bug in this 4-line function?
  - **Voiceover (Optional):** There is a critical mistake in this 4-line JavaScript function. Can you find it?

- **00:04 - 00:10 | Inspection & Countdown**
  - **Visual:** Timer ring counts down from 10 to 3 seconds with audible ticks.
  - **Code on Screen:**
    ```javascript
    function hasDiscount(price, code) {
      if (code = "SAVE10") {
        return price * 0.9;
      }
    }
    ```
  - **On-Screen Text:** Comment the line number before the countdown ends.
  - **Voiceover (Optional):** Look closely at line 2. Comment your answer before time runs out.

- **00:11 - 00:15 | The Freeze & Teaser**
  - **Visual:** Timer freezes at 1 second. Screen pauses with an arrow pointing to the code.
  - **On-Screen Text:**
    Did you catch it?
    Line 2 uses a single equals sign.
    Full reveal and explanation in the next video.
    Play more at wrench-wise.com by Wrench Wise.
  - **Voiceover (Optional):** Did you catch it? Line 2 assigns instead of compares. Follow Wrench Wise for the next challenge.
