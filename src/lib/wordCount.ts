import { splitFrontmatter } from "./frontmatter";

/**
 * Strips common Markdown formatting syntax so words inside prose are counted
 * without syntax tokens (like headings `#`, bullets `-`, bold/italic `**`, etc.)
 * inflating the word count.
 */
export function stripMarkdownSyntax(markdown: string): string {
  return (
    markdown
      // Code fence markers
      .replace(/^```[a-zA-Z0-9_-]*\s*$/gm, "")
      // Headings
      .replace(/^#{1,6}\s+/gm, "")
      // Blockquotes
      .replace(/^>\s+/gm, "")
      // Unordered and task lists
      .replace(/^(\s*[-*+]\s*(\[[ xX]\]\s*)?)/gm, "")
      // Ordered lists
      .replace(/^(\s*\d+\.\s*)/gm, "")
      // Horizontal rules
      .replace(/^[-*_]{3,}\s*$/gm, "")
      // Images ![alt](url) -> alt
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
      // Markdown links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      // Wiki links [[note|alias]] -> alias, [[note]] -> note
      .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, "$1")
      // Inline code `code` -> code
      .replace(/`([^`]+)`/g, "$1")
      // Bold, italic, strikethrough: **text**, *text*, __text__, _text_, ~~text~~
      .replace(/(\*\*|__|\*|_|~~)(.*?)\1/g, "$2")
  );
}

/**
 * Counts prose words in a markdown string, ignoring Markdown syntax formatting.
 */
export function countWords(markdown: string): number {
  const text = stripMarkdownSyntax(markdown).trim();
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

/**
 * Given the entire raw markdown note and a selection range [from, to],
 * extracts only the selected text portion that falls within the note's body,
 * excluding any frontmatter block.
 */
export function extractBodySelection(
  rawText: string,
  from: number,
  to: number,
): string {
  if (from >= to) return "";
  const { frontmatter } = splitFrontmatter(rawText);
  const bodyStart = frontmatter.length;

  // Selection is entirely within frontmatter
  if (to <= bodyStart) return "";

  // Selection starts inside frontmatter but extends into body
  const effectiveFrom = Math.max(from, bodyStart);
  return rawText.slice(effectiveFrom, to);
}
