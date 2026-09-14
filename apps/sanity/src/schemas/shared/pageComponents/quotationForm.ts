import { defineField, defineType } from "sanity";

const audienceTitles: Record<string, string> = {
  teamBuilding: "Devis team building",
  musiTeens: "Devis Musi'Teens",
};

export const quotationFormType = defineType({
  name: "quotationForm",
  title: "Quotation Form",
  type: "object",
  fields: [
    defineField({
      name: "audience",
      title: "Audience",
      description:
        "Which event the quote is for. Only the prestations ticked for it are offered.",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { value: "teamBuilding", title: "Team building" },
          { value: "musiTeens", title: "Musi'Teens" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
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
      audience: "audience",
      venueTitle: "venue.title",
    },
    prepare({
      audience,
      venueTitle,
    }: {
      audience?: string;
      venueTitle?: string;
    }) {
      return {
        title: (audience && audienceTitles[audience]) ?? "Devis",
        subtitle: ["Quotation Form", venueTitle].filter(Boolean).join(" · "),
      };
    },
  },
});
