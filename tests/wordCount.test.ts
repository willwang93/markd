import { describe, expect, test } from "bun:test";
import {
  countWords,
  extractBodySelection,
  stripMarkdownSyntax,
} from "../src/lib/wordCount";

describe("word counting", () => {
  test("counts simple prose words", () => {
    expect(countWords("Hello world")).toBe(2);
    expect(countWords("One two three four five")).toBe(5);
    expect(countWords("")).toBe(0);
    expect(countWords("   \n\t  ")).toBe(0);
  });

  test("excludes markdown headings from word count", () => {
    expect(countWords("# Hello world")).toBe(2);
    expect(countWords("## Subtitle")).toBe(1);
    expect(countWords("###### Deep heading with multiple words")).toBe(5);
  });

  test("excludes list markers and blockquotes", () => {
    expect(countWords("- Item one\n- Item two")).toBe(4);
    expect(countWords("* Star item")).toBe(2);
    expect(countWords("- [ ] Unchecked todo\n- [x] Done todo")).toBe(4);
    expect(countWords("1. First item\n2. Second item")).toBe(4);
    expect(countWords("> Blockquote line")).toBe(2);
  });

  test("handles links, inline code, and formatting markers", () => {
    expect(countWords("[Markd app](https://markd.app)")).toBe(2);
    expect(countWords("![alt text](https://example.com/image.png)")).toBe(2);
    expect(countWords("[[Daily Note|Today's Note]]")).toBe(2);
    expect(countWords("[[SimpleNote]]")).toBe(1);
    expect(countWords("**bold** *italic* ~~strike~~ `code`")).toBe(4);
  });
});

describe("extractBodySelection", () => {
  const doc = [
    "---",
    'title: "Example"',
    "status: done",
    "---",
    "",
    "Hello world",
    "Second line",
  ].join("\n");

  test("returns empty string when selection is entirely within frontmatter", () => {
    // Select "title: "Example""
    const from = doc.indexOf("title");
    const to = from + 16;
    expect(extractBodySelection(doc, from, to)).toBe("");
    expect(countWords(extractBodySelection(doc, from, to))).toBe(0);
  });

  test("returns only body portion when selection spans across frontmatter and body", () => {
    // Select from status to "Hello"
    const from = doc.indexOf("status");
    const to = doc.indexOf("Hello") + 5;
    const extracted = extractBodySelection(doc, from, to);
    expect(extracted).toBe("\nHello");
    expect(countWords(extracted)).toBe(1);
  });

  test("returns selected body text when selection is entirely in body", () => {
    const from = doc.indexOf("Hello world");
    const to = from + "Hello world".length;
    const extracted = extractBodySelection(doc, from, to);
    expect(extracted).toBe("Hello world");
    expect(countWords(extracted)).toBe(2);
  });

  test("handles document without frontmatter", () => {
    const noFm = "Simple body text without frontmatter";
    const from = noFm.indexOf("body");
    const to = from + 4;
    expect(extractBodySelection(noFm, from, to)).toBe("body");
    expect(countWords(extractBodySelection(noFm, from, to))).toBe(1);
  });
});
