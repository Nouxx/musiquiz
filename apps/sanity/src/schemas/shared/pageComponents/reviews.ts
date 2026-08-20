import { defineField, defineType } from "sanity";

export const reviewsType = defineType({
  name: "reviews",
  title: "Reviews",
  type: "object",
  fields: [
    defineField({
      name: "venue",
      title: "Venue",
      description: "Only fetch reviews for a specific venue",
      type: "reference",
      to: [{ type: "venue" }],
    }),
    defineField({
      name: "starsThreshold",
      title: "Minimum number of stars",
      type: "number",
      initialValue: 5,
      options: {
        list: [
          { title: "4", value: 4 },
          { title: "5", value: 5 },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "surface",
      title: "Background",
      type: "string",
      initialValue: "default",
      options: {
        list: [
          { title: "Default", value: "default" },
          { title: "Muted", value: "muted" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "searchTerm",
      title: "Word filter",
      description: "Filter reviews with a word, example: 'evjf' (case insensitive)",
      type: "string",
    }),
  ],
  preview: {
    select: {
      venueTitle: "venue.title",
    },
    prepare({ venueTitle }: { venueTitle: string | undefined }) {
      return {
        title: "Reviews",
        subtitle: venueTitle ? `for ${venueTitle}` : "Global"
      };
    },
  },
});
