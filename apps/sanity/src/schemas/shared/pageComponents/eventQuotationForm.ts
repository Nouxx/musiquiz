import { defineField, defineType } from "sanity";

export const eventQuotationFormType = defineType({
  name: "eventQuotationForm",
  title: "Event Quotation Form",
  type: "object",
  fields: [
    defineField({
      name: "venue",
      title: "Venue",
      description:
        "The prestations a visitor can tick are the ones listed on this venue.",
      type: "reference",
      to: [{ type: "venue" }],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      venueTitle: "venue.title",
    },
    prepare({ venueTitle }: { venueTitle?: string }) {
      return {
        title: "Demande de devis",
        subtitle: ["Event Quotation Form", venueTitle]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
