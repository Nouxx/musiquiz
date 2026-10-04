import { defineField, defineType } from "sanity";
import { RocketIcon } from "@sanity/icons/Rocket";
import { pageGroups } from "./shared/seo";

export const joinTheNetworkPageType = defineType({
  name: "joinTheNetworkPage",
  title: "Join the network page",
  type: "document",
  icon: RocketIcon,
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
      name: "pageComponents",
      group: "content",
      type: "pageComponents",
      description: "Note: the last component of this page will be the form.",
    }),
    defineField({
      name: "seo",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Join the network page" };
    },
  },
});
