import {
  defineArrayMember,
  defineField,
  defineType,
  type PortableTextPluginsProps,
} from "sanity";
import { richTextDecorators } from "./richText";

const linkAnnotation = defineArrayMember({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "href",
      title: "URL",
      description:
        "A full address, or a path on this site like /paris/reserver/. Paths are safe here: the blog has no English version. Every page of this site is listed in the Site URLs tab.",
      type: "url",
      validation: (rule) =>
        rule.required().uri({
          scheme: ["http", "https", "mailto", "tel"],
          allowRelative: true,
        }),
    }),
  ],
});

export type BodyMember = {
  _type: string;
  headerRows?: number;
  rows?: unknown[];
};

// on the table type itself, the rule never runs under the Studio's table editing,
// and an error pathed to the table only shows in the validation panel
export function validateTables(body: BodyMember[] | undefined) {
  const tables = body?.filter((member) => member._type === "table") ?? [];
  if (tables.some((table) => table.headerRows !== 1)) {
    return "A table has no header row. Turn it on: the first row names the columns.";
  }
  if (tables.some((table) => (table.rows?.length ?? 0) < 2)) {
    return "A table has only its header row. Add at least one row below it.";
  }
  return true;
}

// the field names are the ones the Studio's table editing binds to: https://www.sanity.io/docs/studio/portable-text-editor-configuration#table-editing
export const articleTableType = defineType({
  name: "table",
  title: "Table",
  type: "object",
  description:
    "A header row naming the columns, then the rows. The first column reads as the label of its row.",
  fields: [
    defineField({ name: "headerRows", type: "number" }),
    defineField({
      name: "rows",
      type: "array",
      of: [
        defineArrayMember({
          name: "row",
          type: "object",
          fields: [
            defineField({
              name: "cells",
              type: "array",
              of: [
                defineArrayMember({
                  name: "cell",
                  type: "object",
                  fields: [
                    defineField({
                      name: "value",
                      type: "array",
                      of: [
                        defineArrayMember({
                          type: "block",
                          styles: [{ title: "Paragraph", value: "normal" }],
                          lists: [],
                          marks: {
                            decorators: richTextDecorators,
                            annotations: [linkAnnotation],
                          },
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
});

function withTableEditing(props: PortableTextPluginsProps) {
  return props.renderDefault({
    ...props,
    plugins: { ...props.plugins, table: { enabled: true } },
  });
}

export const articleBodyType = defineType({
  name: "articleBody",
  title: "Article body",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Paragraph", value: "normal" },
        { title: "Heading", value: "h2" },
        { title: "Sub-heading", value: "h3" },
      ],
      lists: [{ title: "Bullets", value: "bullet" }],
      marks: {
        decorators: richTextDecorators,
        annotations: [linkAnnotation],
      },
    }),
    defineArrayMember({ type: "imageWithAlt" }),
    defineArrayMember({ type: "table" }),
  ],
  components: { portableText: { plugins: withTableEditing } },
});
