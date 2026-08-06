import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "branding", title: "Branding", default: true },
    { name: "social", title: "Social" },
    { name: "contact", title: "Contact" },
    { name: "payment", title: "Payment" }, // todo: find a better name later
  ],
  fields: [
    defineField({
      name: "headerLogo",
      title: "Header logo",
      group: "branding",
      validation: (rule) => rule.required(),
      type: "imageWithAlt",
    }),
    defineField({
      name: "footerLogo",
      title: "Footer logo",
      group: "branding",
      validation: (rule) => rule.required(),
      type: "imageWithAlt",
    }),
    defineField({
      name: "facebookUrl",
      title: "Facebook link",
      type: "url",
      group: "social",
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram link",
      type: "url",
      group: "social",
    }),
    defineField({
      name: "tiktokUrl",
      title: "TikTok link",
      type: "url",
      group: "social",
    }),
    defineField({
      name: "youtubeUrl",
      title: "Youtube link",
      type: "url",
      group: "social",
    }),
    defineField({
      name: "linkedinUrl",
      title: "Linkedin link",
      type: "url",
      group: "social",
    }),
    defineField({
      name: "mainPhone",
      title: "Main phone",
      type: "string",
      validation: (rule) => rule.required(),
      group: "contact",
    }),
    defineField({
      name: "mainEmail",
      title: "Main email",
      type: "string",
      validation: (rule) => rule.required(),
      group: "contact",
    }),
    defineField({
      name: "acceptedPaymentMethods",
      title: "Accepted payment methods",
      description: "Re-order items to decide the order of appearance",
      type: "array",
      of: [{ type: "imageWithAlt" }],
      group: "payment",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Site Settings",
      };
    },
  },
});
