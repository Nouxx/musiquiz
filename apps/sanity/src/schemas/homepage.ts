import { defineField, defineType } from "sanity";

export const homepageType = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "subtitle",
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
