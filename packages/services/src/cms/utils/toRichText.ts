import type { SanityRichText } from "@repo/api/sanity/shared/richText";

import type { RichText } from "../types";

const BOLD_DECORATOR = "strong";

export function toRichText(blocks: SanityRichText): RichText {
  return blocks.map((block) => ({
    type: "paragraph",
    spans: block.children.map((child) => {
      const link = block.markDefs.find((annotation) =>
        child.marks.includes(annotation._key),
      );

      return {
        text: child.text,
        bold: child.marks.includes(BOLD_DECORATOR) || undefined,
        href: link?.href,
      };
    }),
  }));
}
