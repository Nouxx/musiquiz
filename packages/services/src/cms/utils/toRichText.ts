import type { SanityRichText } from "@repo/api/sanity/shared/richText";

import type { RichText, RichTextSpan } from "../types";

const BOLD_DECORATOR = "strong";
const ITALIC_DECORATOR = "em";
const UNDERLINE_DECORATOR = "underline";
const STRIKE_DECORATOR = "strike-through";

// Enter already starts a paragraph, so Shift+Enter gives one break and never a gap: docs/adr/0032
function toLineBreaks(
  text: string,
  { first, last }: { first: boolean; last: boolean },
) {
  const collapsed = text.replaceAll(/\s*\n\s*/g, "\n");
  const start = first ? collapsed.replace(/^\n/, "") : collapsed;

  return last ? start.replace(/\n$/, "") : start;
}

export function toRichTextSpans({
  children,
  markDefs,
}: Pick<SanityRichText[number], "children" | "markDefs">): RichTextSpan[] {
  return children.map((child, index) => {
    const link = markDefs.find((annotation) =>
      child.marks.includes(annotation._key),
    );

    return {
      text: toLineBreaks(child.text, {
        first: index === 0,
        last: index === children.length - 1,
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
