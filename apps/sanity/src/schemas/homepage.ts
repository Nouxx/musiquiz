import { defineField, defineType } from "sanity";

export const homepageType = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "logo",
      title: "Homepage logo",
      type: "imageWithAlt",
    }),
    defineField({
      name: "badge",
      title: "Badge label",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "heading",
      type: "internationalizedArrayString",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Homepage",
      };
    },
  },
});
