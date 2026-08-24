import type { Lang } from "@repo/utils/lang";
import { z } from "zod";

/**
 * Authored multi-paragraph content — paragraphs, bold, links.
 *
 * The projection stays close to what Portable Text actually stores, because a
 * mark is either a decorator name (`"strong"`) or a key into `markDefs`, and
 * resolving that is a join. GROQ can express it and states it badly, so the
 * join is done in `@repo/services` instead and this layer only proves the
 * payload has the shape that join expects.
 */
export function richTextProjection({
  field,
  lang,
}: {
  field: string;
  lang: Lang;
}) {
  return `${field}[language == "${lang}"][0].value[]{
    _type,
    style,
    children[]{ _type, text, "marks": coalesce(marks, []) },
    "markDefs": coalesce(markDefs[]{ _key, href }, [])
  }`;
}

const sanityRichTextSpanSchema = z.strictObject({
  _type: z.literal("span"),
  text: z.string(),
  marks: z.array(z.string()),
});

const sanityRichTextLinkSchema = z.strictObject({
  _key: z.string().min(1),
  href: z.string().min(1),
});

const sanityRichTextBlockSchema = z.strictObject({
  _type: z.literal("block"),
  // pinned on purpose: the day someone enables headings the build fails here, naming the field, rather than rendering a heading as body copy
  style: z.literal("normal"),
  children: z.array(sanityRichTextSpanSchema).min(1),
  markDefs: z.array(sanityRichTextLinkSchema),
});

export const sanityRichTextSchema = z.array(sanityRichTextBlockSchema).min(1);

export type SanityRichText = z.infer<typeof sanityRichTextSchema>;
