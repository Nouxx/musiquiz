import { z } from "zod";

import { imageProjection, sanityImageSchema } from "./image";
import { sanityRichTextLinkSchema, sanityRichTextSpanSchema } from "./richText";

// the blog is french only
export function articleBodyProjection({ field }: { field: string }) {
  return `${field}[]{
    _type,
    _type == "block" => {
      style,
      listItem,
      children[]{ _type, text, "marks": coalesce(marks, []) },
      "markDefs": coalesce(markDefs[]{ _key, href }, [])
    },
    _type == "imageWithAlt" => ${imageProjection({ lang: "fr" })}
  }`;
}

const sanityArticleBlockSchema = z.strictObject({
  _type: z.literal("block"),
  style: z.enum(["normal", "h2", "h3"]),
  listItem: z.literal("bullet").nullable(),
  children: z.array(sanityRichTextSpanSchema).min(1),
  markDefs: z.array(sanityRichTextLinkSchema),
});

const sanityArticleImageSchema = sanityImageSchema.extend({
  _type: z.literal("imageWithAlt"),
});

export const sanityArticleBodySchema = z
  .array(
    z.discriminatedUnion("_type", [
      sanityArticleBlockSchema,
      sanityArticleImageSchema,
    ]),
  )
  .min(1);

export type SanityArticleBody = z.infer<typeof sanityArticleBodySchema>;
