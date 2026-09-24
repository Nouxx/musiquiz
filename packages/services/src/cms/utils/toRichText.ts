import type { SanityRichText } from "@repo/api/sanity/shared/richText";

import type { RichText, RichTextSpan } from "../types";

const BOLD_DECORATOR = "strong";

export function toRichTextSpans({
  children,
  markDefs,
}: Pick<SanityRichText[number], "children" | "markDefs">): RichTextSpan[] {
  return children.map((child) => {
    const link = markDefs.find((annotation) =>
      child.marks.includes(annotation._key),
    );

    return {
      text: child.text,
      bold: child.marks.includes(BOLD_DECORATOR) || undefined,
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
