import { defineField, defineType } from "sanity";
import { pageGroups } from "./shared/seo";

export const homepageType = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  groups: pageGroups,
  fields: [
    defineField({
      name: "logo",
      group: "content",
      title: "Homepage logo",
      type: "imageWithAlt",
    }),
    defineField({
      name: "cover",
      group: "content",
      title: "Homepage cover",
      type: "imageWithAlt",
    }),
    defineField({
      name: "badge",
      group: "content",
      title: "Badge label",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "heading",
      group: "content",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "venuesCta",
      group: "content",
      title: "Venues section call to action",
      description: "The button under the list of venues. Leave empty for none.",
      type: "cta",
    }),
    defineField({
      name: "pageComponents",
      group: "content",
      type: "pageComponents",
    }),
    defineField({
      name: "seo",
      type: "seo",
      group: "seo",
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
