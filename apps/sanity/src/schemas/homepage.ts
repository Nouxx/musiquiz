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
      name: "cover",
      title: "Homepage cover",
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
    defineField({
      name: "venuesCta",
      title: "Venues section call to action",
      description: "The button under the list of venues. Leave empty for none.",
      type: "cta",
    }),
    defineField({
      name: "pageComponents",
      type: "pageComponents",
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
