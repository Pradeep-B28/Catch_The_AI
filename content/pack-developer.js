// LOCKED CONTENT. Every challenge here is checked by tools/verify-content.mjs.
// Do not change it unless the content check passes afterwards.
// Field meanings are in content/SCHEMA.md.

export default {
  id: "d",
  name: "Developer",
  tagline: "Loops, hash maps, sorting and more.",
  language: "javascript",
  packVersion: 1,
  challenges: [
    {
      id: "d01",
      level: 1,
      title: "Largest number",
      task: "Return the largest number in the list. For [-5, -2, -9] it should be -2.",
      code: [
        "function maxOf(arr) {",
        "  let best = 0;",
        "  for (const x of arr) {",
        "    if (x > best) best = x;",
        "  }",
        "  return best;",
        "}"
      ],
      bugLine: 2,
      fix: "  let best = arr[0];",
      test: { call: "maxOf([-5, -2, -9])", expected: "-2", aiGot: "0" },
      checks: [["maxOf([3, 8, 1])", "8"], ["maxOf([7])", "7"]],
      why: "Starting at 0 means a list of only negative numbers never beats it. Start from the first item instead.",
      concept: "Starting values"
    },
    {
      id: "d02",
      level: 2,
      title: "Binary search",
      task: "Return the index of t in a sorted list, or -1. find([1, 3, 5, 7], 7) should return 3.",
      code: [
        "function find(arr, t) {",
        "  let lo = 0, hi = arr.length - 1;",
        "  while (lo < hi) {",
        "    const m = Math.floor((lo + hi) / 2);",
        "    if (arr[m] === t) return m;",
        "    if (arr[m] < t) lo = m + 1;",
        "    else hi = m - 1;",
        "  }",
        "  return -1;",
        "}"
      ],
      bugLine: 3,
      fix: "  while (lo <= hi) {",
      test: { call: "find([1, 3, 5, 7], 7)", expected: "3", aiGot: "-1" },
      checks: [["find([1, 3, 5, 7], 1)", "0"], ["find([1, 3, 5, 7], 4)", "-1"], ["find([2], 2)", "0"]],
      why: "When lo and hi meet, one item is still unchecked. The loop stops one step early, so that last item is never found.",
      concept: "Loop limits"
    },
    {
      id: "d03",
      level: 1,
      title: "Admin check",
      task: "Return true if any user in the list is an admin.",
      code: [
        "function hasAdmin(users) {",
        "  const roles = users.map(u => u.role);",
        "  return roles.contains(\"admin\");",
        "}"
      ],
      bugLine: 3,
      fix: "  return roles.includes(\"admin\");",
      test: { call: "hasAdmin([{ role: \"admin\" }])", expected: "true", aiGot: "Error: roles.contains is not a function" },
      checks: [["hasAdmin([{ role: \"user\" }])", "false"], ["hasAdmin([])", "false"]],
      why: "JavaScript arrays have no contains method. AI tools often invent methods that sound right. The real one is includes.",
      concept: "Made-up methods"
    },
    {
      id: "d04",
      level: 2,
      title: "Palindrome check",
      task: "Return true if a word reads the same backwards. malayalam should return true.",
      code: [
        "function isPal(s) {",
        "  let i = 0, j = s.length - 1;",
        "  while (i < j) {",
        "    if (s[i] !== s[j]) return false;",
        "    i++;",
        "    j++;",
        "  }",
        "  return true;",
        "}"
      ],
      bugLine: 6,
      fix: "    j--;",
      test: { call: "isPal(\"malayalam\")", expected: "true", aiGot: "false" },
      checks: [["isPal(\"chennai\")", "false"], ["isPal(\"a\")", "true"], ["isPal(\"abba\")", "true"]],
      why: "Both pointers move right, so j runs off the end of the word. j must move left, towards i.",
      concept: "Two pointers"
    },
    {
      id: "d05",
      level: 2,
      title: "Letter counter",
      task: "Count how often each letter appears. banana has 3 a's and 2 n's.",
      code: [
        "function countChars(s) {",
        "  const map = {};",
        "  for (const ch of s) {",
        "    map[ch] = 1;",
        "  }",
        "  return map;",
        "}"
      ],
      bugLine: 4,
      fix: "    map[ch] = (map[ch] || 0) + 1;",
      test: { call: "countChars(\"banana\")", expected: "{\"b\":1,\"a\":3,\"n\":2}", aiGot: "{\"b\":1,\"a\":1,\"n\":1}" },
      checks: [["countChars(\"\")", "{}"], ["countChars(\"aab\")", "{\"a\":2,\"b\":1}"]],
      why: "It sets every count to 1 instead of adding 1. Repeated letters are only ever counted once.",
      concept: "Hash maps"
    },
    {
      id: "d06",
      level: 3,
      title: "Two sum",
      task: "Return the indexes of two numbers that add up to target. For [2, 7, 11, 15] and 9, return [0, 1].",
      code: [
        "function twoSum(a, target) {",
        "  const seen = new Map();",
        "  for (let i = 0; i < a.length; i++) {",
        "    const need = a[i] - target;",
        "    if (seen.has(need)) {",
        "      return [seen.get(need), i];",
        "    }",
        "    seen.set(a[i], i);",
        "  }",
        "  return [];",
        "}"
      ],
      bugLine: 4,
      fix: "    const need = target - a[i];",
      test: { call: "twoSum([2, 7, 11, 15], 9)", expected: "[0,1]", aiGot: "[0,2]" },
      checks: [["twoSum([3, 2, 4], 6)", "[1,2]"], ["twoSum([1, 2], 7)", "[]"]],
      why: "It looks for a[i] minus target instead of target minus a[i]. It even returns an answer, [0, 2], but 2 + 11 is 13, not 9.",
      concept: "Hash maps"
    },
    {
      id: "d07",
      level: 1,
      title: "Factorial",
      task: "Return the factorial of n. fact(5) is 5 x 4 x 3 x 2 x 1, which is 120.",
      code: [
        "function fact(n) {",
        "  if (n === 0) return 0;",
        "  return n * fact(n - 1);",
        "}"
      ],
      bugLine: 2,
      fix: "  if (n === 0) return 1;",
      test: { call: "fact(5)", expected: "120", aiGot: "0" },
      checks: [["fact(0)", "1"], ["fact(1)", "1"], ["fact(6)", "720"]],
      why: "The base case returns 0, and anything multiplied by 0 is 0. The factorial of 0 is 1.",
      concept: "Recursion base case"
    },
    {
      id: "d08",
      level: 2,
      title: "Top 3 scores",
      task: "Return the three highest scores, highest first. For [90, 100, 85, 9] return [100, 90, 85].",
      code: [
        "function top3(xs) {",
        "  const s = [...xs].sort();",
        "  return s.reverse().slice(0, 3);",
        "}"
      ],
      bugLine: 2,
      fix: "  const s = [...xs].sort((a, b) => a - b);",
      test: { call: "top3([90, 100, 85, 9])", expected: "[100,90,85]", aiGot: "[90,9,85]" },
      checks: [["top3([1, 2, 3, 4])", "[4,3,2]"], ["top3([5, 25, 100])", "[100,25,5]"]],
      why: "sort() with nothing inside sorts numbers as text, so 100 comes before 85 and 9 comes before 90. Pass (a, b) => a - b to sort as numbers.",
      concept: "Sorting"
    },
    {
      id: "d09",
      level: 3,
      title: "Sliding window",
      task: "Return the largest sum of k items in a row. For [1, 2, 3, 4, 5] and k = 2 it is 9.",
      code: [
        "function maxWindow(a, k) {",
        "  let sum = 0;",
        "  for (let i = 0; i < k; i++) {",
        "    sum += a[i];",
        "  }",
        "  let best = sum;",
        "  for (let i = k; i < a.length; i++) {",
        "    sum += a[i] - a[i - 1];",
        "    best = Math.max(best, sum);",
        "  }",
        "  return best;",
        "}"
      ],
      bugLine: 8,
      fix: "    sum += a[i] - a[i - k];",
      test: { call: "maxWindow([1, 2, 3, 4, 5], 2)", expected: "9", aiGot: "6" },
      checks: [["maxWindow([5, 1, 1, 5], 2)", "6"], ["maxWindow([2, 9, 1, 3], 3)", "13"], ["maxWindow([4, 2], 1)", "4"]],
      why: "A sliding window adds the new item and drops the one k steps back. This drops the item just before instead.",
      concept: "Sliding window"
    },
    {
      id: "d10",
      level: 3,
      title: "Vowel counter",
      task: "Count the vowels in a word. India has 3.",
      code: [
        "function vowels(s) {",
        "  let count = 0;",
        "  for (const ch of s) {",
        "    if (\"aeiou\".includes(ch)) count++;",
        "  }",
        "  return count;",
        "}"
      ],
      bugLine: 3,
      fix: "  for (const ch of s.toLowerCase()) {",
      test: { call: "vowels(\"India\")", expected: "3", aiGot: "2" },
      checks: [["vowels(\"CHENNAI\")", "3"], ["vowels(\"rhythm\")", "0"]],
      why: "It only checks lowercase vowels, so the capital I is missed. Lowercase the text first.",
      concept: "Edge cases"
    }
  ]
};
