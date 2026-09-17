import {
  defineArrayMember,
  defineField,
  defineType,
  type PreviewValue,
} from "sanity";
import { CreditCardIcon } from "@sanity/icons/CreditCard";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { ImageIcon } from "@sanity/icons/Image";
import { ShareIcon } from "@sanity/icons/Share";
import { UserIcon } from "@sanity/icons/User";
import { UsersIcon } from "@sanity/icons/Users";
import { frenchValue, type LocalizedEntry } from "./shared/frenchValue";

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
    defineField({
      name: "teamMembers",
      title: "Team members",
      description: "Shown on the contact page, in this order",
      type: "array",
      of: [defineArrayMember({ type: "teamMember" })],
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

export const teamMemberType = defineType({
  name: "teamMember",
  title: "Team member",
  type: "object",
  icon: UserIcon,
  fields: [
    defineField({
      name: "photo",
      title: "Photo",
      type: "imageWithAlt",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      description: 'The badge. Example: "C.E.O"',
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "jobTitle",
      title: "Job title",
      description: 'Example: "Fondateur de Musi\'Quiz"',
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tone",
      title: "Tone",
      description: "Card, badge and photo ring color",
      type: "string",
      initialValue: "blue",
      validation: (rule) => rule.required(),
      options: {
        list: [
          { title: "Blue", value: "blue" },
          { title: "Red", value: "red" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "email",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "name", role: "role", media: "photo" },
    prepare({
      title,
      role,
      media,
    }: {
      title?: string;
      role?: LocalizedEntry[];
      media?: PreviewValue["media"];
    }) {
      return { title, subtitle: frenchValue(role), media };
    },
  },
});
