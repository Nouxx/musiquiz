import { defineArrayMember, defineField, defineType } from "sanity";

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
        decorators: [{ title: "Bold", value: "strong" }],
        annotations: [
          defineArrayMember({
            name: "link",
            title: "Link",
            type: "object",
            fields: [
              defineField({
                name: "href",
                title: "URL",
                description:
                  "A full address, or a path on this site like /paris/reserver. Paths are safe here: the blog has no English version.",
                type: "url",
                validation: (rule) =>
                  rule.required().uri({
                    scheme: ["http", "https", "mailto", "tel"],
                    allowRelative: true,
                  }),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({ type: "imageWithAlt" }),
  ],
});
