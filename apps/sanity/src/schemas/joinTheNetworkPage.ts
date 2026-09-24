import { defineField, defineType } from "sanity";
import { RocketIcon } from "@sanity/icons/Rocket";

export const joinTheNetworkPageType = defineType({
  name: "joinTheNetworkPage",
  title: "Join the network page",
  type: "document",
  icon: RocketIcon,
  fields: [
    defineField({
      name: "pageCover",
      title: "Page Cover",
      type: "pageCover",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pageComponents",
      type: "pageComponents",
      description: "Note: the last component of this page will be the form.",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Join the network page" };
    },
  },
});
