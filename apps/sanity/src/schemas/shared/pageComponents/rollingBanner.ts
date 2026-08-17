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
      validation: (Rule) => [
        Rule.custom((entries?: { value?: string }[]) => {
          const tooLong = entries?.filter((e) => (e.value?.length ?? 0) > 70);
          const tooShort = entries?.filter(
            (e) => e.value && e.value.length < 8,
          );
          if (tooLong?.length)
            return "Keep each translation under 70 characters";
          if (tooShort?.length) return "At least 8 characters";
          return true;
        }),
        Rule.warning().custom((entries?: { value?: string }[]) =>
          entries?.some((e) => (e.value?.length ?? 0) > 55)
            ? "Longer than the line this banner was designed for (55 characters)"
            : true,
        ),
      ],
    }),
    defineField({
      name: "color",
      title: "Color",
      description: "The color of the strip the message scrolls across.",
      type: "string",
      validation: (Rule) => Rule.required(),
      initialValue: "red",
      options: {
        list: [
          { title: "Red", value: "red" },
          { title: "Blue", value: "blue" },
        ],
        layout: "radio",
      },
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
