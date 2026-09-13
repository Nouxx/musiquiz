import { defineField, defineType } from "sanity";

export const teamBuildingQuotationFormType = defineType({
  name: "teamBuildingQuotationForm",
  title: "Team Building Quotation Form",
  type: "object",
  fields: [
    defineField({
      name: "venue",
      title: "Venue",
      description:
        "The prestations a visitor can tick are the ones listed on this venue, and the enquiry is sent to its mailbox.",
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
        title: "Devis team building",
        subtitle: ["Team Building Quotation Form", venueTitle]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
