import { z } from "zod";

import { imageProjection, sanityImageSchema } from "./image";
import {
  sanityRichTextBlockSchema,
  sanityRichTextLinkSchema,
  sanityRichTextSpanSchema,
} from "./richText";

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
    _type == "imageWithAlt" => ${imageProjection({ lang: "fr" })},
    _type == "table" => {
      headerRows,
      rows[]{
        cells[]{
          "value": coalesce(value[]{
            _type,
            style,
            children[]{ _type, text, "marks": coalesce(marks, []) },
            "markDefs": coalesce(markDefs[]{ _key, href }, [])
          }, [])
        }
      }
    }
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

// the Studio validates the shape; this only guards what the renderer relies on
const sanityArticleTableSchema = z.strictObject({
  _type: z.literal("table"),
  headerRows: z.literal(1),
  rows: z
    .array(
      z.strictObject({
        cells: z
          .array(z.strictObject({ value: z.array(sanityRichTextBlockSchema) }))
          .min(1),
      }),
    )
    .min(2),
});

export const sanityArticleBodySchema = z
  .array(
    z.discriminatedUnion("_type", [
      sanityArticleBlockSchema,
      sanityArticleImageSchema,
      sanityArticleTableSchema,
    ]),
  )
  .min(1);

export type SanityArticleBody = z.infer<typeof sanityArticleBodySchema>;
