import { defineArrayMember, defineField, defineType } from "sanity";
import { CreditCardIcon } from "@sanity/icons/CreditCard";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { ImageIcon } from "@sanity/icons/Image";
import { ShareIcon } from "@sanity/icons/Share";
import { UsersIcon } from "@sanity/icons/Users";
import { ogImageDescription, ogImageWarning } from "./shared/seo";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "branding", title: "Branding", icon: ImageIcon, default: true },
    { name: "social", title: "Social", icon: ShareIcon },
    { name: "contact", title: "Contact", icon: EnvelopeIcon },
    { name: "payment", title: "Payment", icon: CreditCardIcon }, // todo: find a better name later
    { name: "team", title: "Team", icon: UsersIcon },
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
      name: "mobileMenuLogo",
      title: "Mobile menu logo",
      description: "Shown on the dark background of the mobile menu.",
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
      name: "ogImage",
      title: "Sharing image",
      description: ogImageDescription(
        "Used by every page that has no sharing image of its own, nor one from its venue.",
      ),
      group: "branding",
      type: "image",
      validation: (rule) => [
        rule.required(),
        rule.custom(ogImageWarning).warning(),
      ],
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
    defineField({
      name: "teamMembers",
      title: "Team members",
      description: "Shown on the contact page, in this order",
      type: "array",
      of: [
        defineArrayMember({ type: "reference", to: [{ type: "teamMember" }] }),
      ],
      group: "team",
      validation: (rule) => rule.required().min(1),
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
