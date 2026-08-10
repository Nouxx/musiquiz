import { defineField, defineType } from "sanity";

export const rollingBannerType = defineType({
  name: "rollingBanner",
  title: "Rolling Banner",
  type: "object",
  fields: [
    defineField({
      name: "message",
      title: "Message",
      description:
        "One short line, repeated and scrolled across the red strip. Every copy says the same thing.",
      type: "internationalizedArrayString",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Rolling Banner",
      };
    },
  },
});

export const dummyType = defineType({
  name: "dummyComponent",
  title: "Dummy Comp",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "text",
      type: "string",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Dummy Component",
      };
    },
  },
});
