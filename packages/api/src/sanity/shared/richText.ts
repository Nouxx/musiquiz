import type { Lang } from "@repo/utils/lang";
import { z } from "zod";

function blocksProjection(path: string) {
  return `${path}[]{
    _type,
    style,
    children[]{ _type, text, "marks": coalesce(marks, []) },
    "markDefs": coalesce(markDefs[]{ _key, href }, [])
  }`;
}

export function richTextProjection({
  field,
  lang,
}: {
  field: string;
  lang: Lang;
}) {
  return blocksProjection(`${field}[language == "${lang}"][0].value`);
}

export function unlocalizedRichTextProjection({ field }: { field: string }) {
  return blocksProjection(field);
}

export const sanityRichTextSpanSchema = z.strictObject({
  _type: z.literal("span"),
  text: z.string(),
  marks: z.array(z.string()),
});

export const sanityRichTextLinkSchema = z.strictObject({
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
