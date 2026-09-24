import { defineField, defineType } from "sanity";
import { PinIcon } from "@sanity/icons/Pin";

export const whereToFindUsPageType = defineType({
  name: "whereToFindUsPage",
  title: "Where to find us page",
  type: "document",
  icon: PinIcon,
  fields: [
    defineField({
      name: "pageCover",
      title: "Page Cover",
      type: "pageCover",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "componentsBeforeMap",
      title: "Before the map",
      type: "pageComponents",
    }),
    defineField({
      name: "venuesCta",
      title: "Map section call to action",
      description: "The button under the list of venues. Leave empty for none.",
      type: "cta",
    }),
    defineField({
      name: "componentsAfterMap",
      title: "After the map",
      type: "pageComponents",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Where to find us page" };
    },
  },
});
