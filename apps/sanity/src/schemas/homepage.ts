import { defineField, defineType } from "sanity";
import { pageGroups } from "./shared/seo";

export const homepageType = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  groups: pageGroups,
  fields: [
    defineField({
      name: "pageCover",
      group: "content",
      title: "Page Cover",
      type: "pageCover",
      initialValue: { aside: "logo" },
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
