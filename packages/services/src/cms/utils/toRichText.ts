import type { SanityRichText } from "@repo/api/sanity/shared/richText";

import type { RichText, RichTextSpan } from "../types";

const BOLD_DECORATOR = "strong";
const ITALIC_DECORATOR = "em";
const UNDERLINE_DECORATOR = "underline";
const STRIKE_DECORATOR = "strike-through";

// Enter already starts a paragraph, so Shift+Enter gives one break and never a gap: docs/adr/0032
function toLineBreaks(
  text: string,
  { atStart, atEnd }: { atStart: boolean; atEnd: boolean },
) {
  const collapsed = text.replaceAll(/\s*\n\s*/g, "\n");
  const start = atStart ? collapsed.replace(/^\n/, "") : collapsed;

  return atEnd ? start.replace(/\n$/, "") : start;
}

export function toRichTextSpans({
  children,
  markDefs,
}: Pick<SanityRichText[number], "children" | "markDefs">): RichTextSpan[] {
  // empty spans are allowed, so the paragraph's edges are its first and last spans with text
  const firstText = children.findIndex((child) => child.text.trim());
  const lastText = children.findLastIndex((child) => child.text.trim());

  return children.map((child, index) => {
    const link = markDefs.find((annotation) =>
      child.marks.includes(annotation._key),
    );

    return {
      text: toLineBreaks(child.text, {
        atStart: firstText === -1 || index <= firstText,
        atEnd: lastText === -1 || index >= lastText,
      }),
      bold: child.marks.includes(BOLD_DECORATOR) || undefined,
      italic: child.marks.includes(ITALIC_DECORATOR) || undefined,
      underline: child.marks.includes(UNDERLINE_DECORATOR) || undefined,
      strike: child.marks.includes(STRIKE_DECORATOR) || undefined,
      href: link?.href,
    };
  });
}

export function toRichText(blocks: SanityRichText): RichText {
  return blocks.map((block) => ({
    type: "paragraph",
    spans: toRichTextSpans(block),
  }));
}
