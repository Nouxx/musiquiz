import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "branding", title: "Branding", default: true },
    { name: "social", title: "Social" },
    { name: "contact", title: "Contact" },
  ],
  fields: [
    defineField({
      name: "headerLogo",
      title: "Header logo",
      group: "branding",
      validation: (rule) => rule.required(),
      type: "string", // todo: use image
    }),
    defineField({
      name: "footerLogo",
      title: "Footer logo",
      group: "branding",
      validation: (rule) => rule.required(),
      type: "string", // todo: use image
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
  ],
  preview: {
    prepare() {
      return {
        title: "Site Settings",
      };
    },
  },
});
