import { defineArrayMember, defineField } from "sanity";

export const richTextFieldType = defineField({
  name: "richText",
  title: "Rich text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [{ title: "Paragraph", value: "normal" }],
      lists: [],
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
                  "The full address, starting with https:// — or mailto: / tel:. A path like /reserver is refused on purpose: it would skip the language prefix and 404 in the other language.",
                type: "url",
                validation: (rule) =>
                  rule.required().uri({
                    scheme: ["http", "https", "mailto", "tel"],
                  }),
              }),
            ],
          }),
        ],
      },
    }),
  ],
});
