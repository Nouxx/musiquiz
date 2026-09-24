import type { SanityArticleBody } from "@repo/api/sanity/shared/articleBody";

import type { ArticleNode } from "../types";
import { toCmsImage } from "./toCmsImage";
import { toRichTextSpans } from "./toRichText";

/** Portable Text stores a list as flat blocks; consecutive items become one list */
export function toArticleBody(blocks: SanityArticleBody): ArticleNode[] {
  const nodes: ArticleNode[] = [];

  for (const block of blocks) {
    if (block._type === "imageWithAlt") {
      const { url, width, height, mimeType, alt } = block;
      nodes.push({
        type: "image",
        image: toCmsImage({ url, width, height, mimeType, alt }),
      });
      continue;
    }

    const spans = toRichTextSpans(block);

    if (block.listItem) {
      const previous = nodes.at(-1);

      if (previous?.type === "list") {
        previous.items.push(spans);
      } else {
        nodes.push({ type: "list", items: [spans] });
      }

      continue;
    }

    if (block.style === "normal") {
      nodes.push({ type: "paragraph", spans });
    } else {
      nodes.push({
        type: "heading",
        level: block.style === "h2" ? 2 : 3,
        spans,
      });
    }
  }

  return nodes;
}
