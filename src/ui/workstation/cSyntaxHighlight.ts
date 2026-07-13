/**
 * Minimal, dependency-free C token classifier for the read-only code
 * viewer. Deliberately not a full lexer/parser — bundle-size and
 * maintenance cost of a real syntax-highlighting library (e.g.
 * Prism/CodeMirror/Monaco) isn't justified for one fixed, trusted demo
 * file. See docs/WORKSTATION_IDE.md "Code viewer" for the tradeoff.
 */
export type CTokenKind =
  | "preprocessor"
  | "comment"
  | "string"
  | "keyword"
  | "type"
  | "number"
  | "identifier"
  | "punctuation"
  | "whitespace";

export interface CToken {
  kind: CTokenKind;
  text: string;
}

const KEYWORDS = new Set([
  "if", "else", "while", "for", "do", "return", "break", "continue",
  "switch", "case", "default", "goto", "sizeof", "typedef", "struct",
  "union", "enum",
]);

const TYPES = new Set([
  "void", "int", "char", "float", "double", "short", "long", "signed",
  "unsigned", "const", "static", "volatile", "extern", "bool",
  "uint8_t", "uint16_t", "uint32_t", "uint64_t",
  "int8_t", "int16_t", "int32_t", "int64_t",
  "true", "false",
]);

// Punctuation excludes `"` so it never greedily swallows a string
// literal's opening quote before the string alternative gets a chance.
const TOKEN_PATTERN =
  /(#[^\n]*)|(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")|(\b\d+[uUlLfF]*\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([^\sA-Za-z0-9_"]+)/g;

export function tokenizeCLine(line: string): CToken[] {
  const tokens: CToken[] = [];
  let match: RegExpExecArray | null;
  TOKEN_PATTERN.lastIndex = 0;

  while ((match = TOKEN_PATTERN.exec(line)) !== null) {
    const [, preprocessor, comment, string, number, word, whitespace, punctuation] = match;

    if (preprocessor) tokens.push({ kind: "preprocessor", text: preprocessor });
    else if (comment) tokens.push({ kind: "comment", text: comment });
    else if (string) tokens.push({ kind: "string", text: string });
    else if (number) tokens.push({ kind: "number", text: number });
    else if (word) {
      if (KEYWORDS.has(word)) tokens.push({ kind: "keyword", text: word });
      else if (TYPES.has(word)) tokens.push({ kind: "type", text: word });
      else tokens.push({ kind: "identifier", text: word });
    } else if (whitespace) tokens.push({ kind: "whitespace", text: whitespace });
    else if (punctuation) tokens.push({ kind: "punctuation", text: punctuation });
  }

  return tokens;
}

export const C_TOKEN_COLORS: Record<CTokenKind, string> = {
  preprocessor: "#c586c0",
  comment: "#6a9955",
  string: "#ce9178",
  keyword: "#569cd6",
  type: "#4ec9b0",
  number: "#b5cea8",
  identifier: "#d4d4d4",
  punctuation: "#d4d4d4",
  whitespace: "#d4d4d4",
};
