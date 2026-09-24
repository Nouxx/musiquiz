import type { ArticleNode, RichTextSpan } from "../types";

const WORDS_PER_MINUTE = 200;

function nodeSpans(node: ArticleNode): RichTextSpan[] {
  switch (node.type) {
    case "paragraph":
    case "heading": {
      return node.spans;
    }
    case "list": {
      return node.items.flat();
    }
    case "image": {
      return [];
    }
  }
}

export function toReadingMinutes(nodes: ArticleNode[]): number {
  const words = nodes
    .flatMap((node) => nodeSpans(node))
    .map((span) => span.text)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
