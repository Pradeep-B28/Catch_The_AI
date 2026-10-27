# Challenge content: what each field means

Every challenge lives in a pack file in this folder. A pack is one game mode, like Beginner or Developer.

After any change here, run this from the project folder. It must end with `RESULT: ALL PASS`.

```
node tools/verify-content.mjs
```

The check runs the AI's code and the fixed code for real, so a challenge cannot go live with a mistake that isn't really there.

## Pack fields

| Field | What it is |
|---|---|
| `id` | One lowercase letter. `b` is Beginner, `d` is Developer. Never change it. |
| `name` | Shown on the mode card, for example "Beginner". |
| `tagline` | One short line under the name. |
| `language` | Always `javascript`. The check can only run JavaScript. |
| `packVersion` | Add 1 whenever you change this pack. |
| `challenges` | The list of challenges. Needs at least as many active ones as `roundSize` in config.js. |

## Challenge fields

| Field | What it is |
|---|---|
| `id` | The pack letter plus a number, like `b11`. **Never reuse or change an id.** Shared links point at ids. |
| `level` | 1 easy, 2 medium, 3 hard. Rounds play easier ones first. |
| `title` | A short name, like "Discount calculator". |
| `task` | What the code should do, with one example, in plain English. |
| `code` | The AI's code, one line per entry. Two spaces per indent. At most 42 characters per line, 3 to 14 lines. |
| `notes` | Optional. One plain-English note per line saying what that line does. Describe what the line really does. Never hint that a line is wrong. Use "" for lines like `}`. |
| `bugLine` | The line with the mistake, counting from 1. |
| `fix` | The corrected version of that line, with the same indent. |
| `test.call` | A call that shows the mistake, like `finalPrice(1000, 10)`. |
| `test.expected` | What the fixed code returns, written the way JSON shows it: numbers as `900`, text in quotes as `"Pass"`, lists as `[1,2]`. |
| `test.aiGot` | What the AI's code returns, in the same style. An error shows as `Error: <message>`. |
| `checks` | Extra calls the fixed code must get right: `[["call", "expected"], ...]`. At least one. |
| `why` | One or two plain sentences: what went wrong and what it would cause. |
| `concept` | A short topic name, like "Loop limits". Shown in "What tripped you up". |
| `retired` | Optional. `true` keeps it out of new rounds but old shared links still play it. **Retire, never delete.** |

## Writing rules

- Plain English, short sentences. No emojis. No long dashes.
- Every mistake must be on one visible line, and only that line changes in the fix.
- Mistakes should be the kind AI tools really make: boundaries, loop limits, wrong order, made-up methods, missing cases.
- Never mock the player. Never mention jobs being replaced, salaries or placements.
- An instructor must read every new challenge before it goes live.
