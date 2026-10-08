import { defineField, defineType } from "sanity";
import { PinIcon } from "@sanity/icons/Pin";
import { pageGroups } from "./shared/seo";

export const whereToFindUsPageType = defineType({
  name: "whereToFindUsPage",
  title: "Where to find us page",
  type: "document",
  icon: PinIcon,
  groups: pageGroups,
  fields: [
    defineField({
      name: "pageCover",
      group: "content",
      title: "Page Cover",
      type: "pageCover",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "componentsBeforeMap",
      group: "content",
      title: "Before the map",
      type: "pageComponents",
    }),
    defineField({
      name: "venuesCta",
      group: "content",
      title: "Map section call to action",
      description: "The button under the list of venues. Leave empty for none.",
      type: "cta",
    }),
    defineField({
      name: "componentsAfterMap",
      group: "content",
      title: "After the map",
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
      return { title: "Where to find us page" };
    },
  },
});
