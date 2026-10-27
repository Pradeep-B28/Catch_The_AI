# Student Explainer: Catch the AI

Welcome to Catch the AI! This guide explains what the game teaches, why these mistakes matter in the age of AI coding assistants, and how the web application was built.

---

## 1. What the Game Teaches

AI code generators write code quickly, but they frequently make subtle logical mistakes:
- The syntax looks clean and compiles without errors.
- The function name and comments look convincing.
- However, when executed with edge cases, the code produces incorrect answers.

Catch the AI trains your code review skills. As an engineer, your job is not just to generate code, but to rigorously read, verify, and catch mistakes before code reaches production.

---

## 2. The 20 Mistakes Grouped by Concept

### Beginner Mode (Packs b01 to b10)
1. **Assignment vs Comparison (b01):** Using a single equals sign (`=`) inside an `if` condition assigns a value rather than testing for equality.
2. **Off-by-One Boundary Errors (b02):** Using greater-than (`>`) instead of greater-than-or-equal (`>=`) excludes the exact boundary value.
3. **Missing Return Statement (b03):** Calculating a result inside a loop or helper without returning it yields `undefined`.
4. **Type Coercion & String Concatenation (b04):** Adding numbers to strings with the `+` operator accidentally converts numbers into strings.
5. **Inverted Modulo Logic (b05):** Checking remainder modulo 2 (`n % 2 !== 0`) when testing for even numbers inverts the condition.
6. **Array Index Out of Bounds (b06):** Looping with `i <= array.length` accesses an undefined element on the last iteration.
7. **Switch Case Fallthrough (b07):** Omitting a `break` statement inside a `switch` block executes subsequent cases unexpectedly.
8. **Accidental In-Place Mutation (b08):** Modifying an input array directly alters external state instead of returning a clean result.
9. **Truthy Truth Values on Empty Containers (b09):** In JavaScript, an empty array `[]` is truthy, so checking `if (array)` does not check if it has items.
10. **Lexicographical String Sorting (b10):** Calling `.sort()` without a comparator sorts numbers alphabetically, placing 100 before 20.

### Developer Mode (Packs d01 to d10)
11. **Shallow vs Deep Object Copying (d01):** Object spread (`{ ...obj }`) only clones the top level; nested objects remain linked references.
12. **Closure Variable Capture (d02):** Re-using shared loop variables across asynchronous callbacks captures stale values.
13. **Floating Point Rounding Precision (d03):** Binary floating-point arithmetic causes values like `0.1 + 0.2` to not equal `0.3`.
14. **Object Reference Equality (d04):** Comparing two distinct objects with `===` compares memory addresses, not key-value contents.
15. **Negative Index Truthiness (d05):** `Array.prototype.findIndex()` returns `-1` when not found, which evaluates to truthy in boolean checks.
16. **Missing Await in Loops (d06):** Using `forEach` with an async callback launches promises concurrently without waiting for them to complete.
17. **Set Reference Identity (d07):** Storing objects in a `Set` checks memory references; identical-looking objects will not deduplicate.
18. **Object Key String Coercion (d08):** Standard JavaScript objects convert all keys to strings, causing non-string keys to collide.
19. **Recursive Base Case Termination (d09):** Missing or incomplete base conditions lead to incorrect termination or stack overflows.
20. **Reduce Accumulator Default Initialization (d10):** Omitting the initial accumulator argument in `.reduce()` uses the first array element, which fails on empty or custom object structures.

---

## 3. How the App Is Built

Catch the AI is built using vanilla web standards (HTML5, modern ES Modules, and CSS tokens), with zero heavy framework bloat:

- **Decoupled Architecture:** The app uses an Event Bus (`events.js`). When a button is clicked or a timer expires, an event is emitted. The sound player, analytics tracker, and screen router listen independently.
- **Accurate Timer:** Instead of relying on `setInterval` ticks (which drift when the CPU is busy), the timer measures the difference between high-precision timestamps using `performance.now()`.
- **Canvas Auto-Fit:** To guarantee that code never wraps and never scrolls horizontally on small phones, the app uses an off-screen HTML5 Canvas and `measureText()` to calculate the ideal font size down to the single pixel.
- **Client-Side Challenge Links:** Challenge links encode the game state directly into URL parameters. No backend database is required for players to challenge friends.

---

## 4. Extension Tasks for Students

Want to sharpen your skills by modifying this codebase? Here are three tasks:

### Task 1: Add a New Challenge
1. Open `content/pack-beginner.js`.
2. Add a new challenge `b11` representing a common JavaScript pitfall.
3. Include task prompt, code lines, bug line, fix line, why explanation, and test assertions in `checks`.
4. Run `node tools/verify-content.mjs` and confirm your challenge passes!

### Task 2: Add a "Hint" Button
1. In `screens/play.js`, add a "Hint" button in the title bar.
2. When pressed:
   - Deduct 5 seconds from the remaining timer.
   - Greys out 50% of the wrong code lines so the player has fewer lines to choose from.
   - Disable the Hint button for the rest of that snippet.

### Task 3: Add a Daily Streak Counter
1. In `localStorage`, store the last date played (in `YYYYMMDD` format) and a streak count under `cta-streak`.
2. When the player completes a daily round:
   - If played yesterday, increment streak by 1.
   - If played today, keep current streak.
   - If missed a day, reset streak to 1.
3. Display the streak count with a flame icon on the home screen!
