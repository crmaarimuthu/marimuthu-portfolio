import { describe, expect, it } from "vitest";
import { tokenizeCLine } from "./cSyntaxHighlight";

describe("tokenizeCLine", () => {
  it("classifies a preprocessor directive as one token", () => {
    const tokens = tokenizeCLine("#include <stdint.h>");
    expect(tokens[0]).toEqual({ kind: "preprocessor", text: "#include <stdint.h>" });
  });

  it("classifies known types and keywords distinctly from identifiers", () => {
    const tokens = tokenizeCLine("static bool led_state = false;");
    const kinds = tokens.filter((t) => t.kind !== "whitespace").map((t) => t.kind);
    expect(kinds).toEqual(["type", "type", "identifier", "punctuation", "type", "punctuation"]);
  });

  it("classifies a line comment as one token", () => {
    const tokens = tokenizeCLine("int x = 1; // trailing comment");
    expect(tokens.some((t) => t.kind === "comment" && t.text === "// trailing comment")).toBe(true);
  });

  it("classifies string literals", () => {
    const tokens = tokenizeCLine('printf("hello");');
    expect(tokens.some((t) => t.kind === "string" && t.text === '"hello"')).toBe(true);
  });

  it("reassembles to the original line when all token text is concatenated", () => {
    const line = "gpio_write(LED_PIN, led_state);";
    const tokens = tokenizeCLine(line);
    expect(tokens.map((t) => t.text).join("")).toBe(line);
  });
});
