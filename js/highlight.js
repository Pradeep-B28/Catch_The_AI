// Syntax highlighter tokenizing JavaScript code lines into styled DOM elements.
// Uses document.createElement and textContent for secure, injection-free rendering.
// Used by the code card, hero animation, and share image preview.

const KEYWORDS = new Set([
  "function",
  "return",
  "let",
  "const",
  "var",
  "if",
  "else",
  "for",
  "while",
  "of",
  "in",
  "new",
  "true",
  "false",
  "null",
  "undefined",
  "break",
  "continue"
]);

/**
 * Tokenize a single line of JavaScript into colored span elements.
 * @param {string} lineText
 * @returns {DocumentFragment}
 */
export function highlightLine(lineText) {
  const frag = document.createDocumentFragment();
  if (!lineText) {
    frag.appendChild(document.createTextNode(" "));
    return frag;
  }

  // Regex matching strings, numbers, identifiers, punctuation, or whitespace
  const tokenRegex = /(".*?"|'.*?'|`.*?`|\/\/.*|\b\d+(?:\.\d+)?\b|[a-zA-Z_$][a-zA-Z0-9_$]*|[(){}\[\]+\-*/%=<>!&|^~?:.,;]+|\s+)/g;

  let match;
  let lastIndex = 0;

  while ((match = tokenRegex.exec(lineText)) !== null) {
    const text = match[0];

    // Determine token category
    let className = "syn-text";

    if (text.startsWith("//")) {
      className = "syn-comment";
    } else if (text.startsWith('"') || text.startsWith("'") || text.startsWith("`")) {
      className = "syn-string";
    } else if (/^\d+(?:\.\d+)?$/.test(text)) {
      className = "syn-number";
    } else if (KEYWORDS.has(text)) {
      className = "syn-keyword";
    } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(text)) {
      // Check if immediately followed by '('
      const remaining = lineText.slice(tokenRegex.lastIndex);
      if (/^\s*\(/.test(remaining)) {
        className = "syn-func";
      } else {
        className = "syn-text";
      }
    } else if (/^[(){}\[\]+\-*/%=<>!&|^~?:.,;]+$/.test(text)) {
      className = "syn-punct";
    }

    if (className === "syn-text" && /^\s+$/.test(text)) {
      frag.appendChild(document.createTextNode(text));
    } else {
      const span = document.createElement("span");
      span.className = className;
      span.textContent = text;
      frag.appendChild(span);
    }

    lastIndex = tokenRegex.lastIndex;
  }

  // Append any residual characters
  if (lastIndex < lineText.length) {
    frag.appendChild(document.createTextNode(lineText.slice(lastIndex)));
  }

  return frag;
}
