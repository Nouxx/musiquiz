import { defineField, defineType, type PreviewValue } from "sanity";
import { UserIcon } from "@sanity/icons/User";
import { frenchValue, type LocalizedEntry } from "./shared/frenchValue";

export const teamMemberType = defineType({
  name: "teamMember",
  title: "Team member",
  type: "document",
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
    // french only, like the blog it is shown on: docs/adr/0013
    defineField({
      name: "bio",
      title: "Short bio",
      description:
        "Shown under the blog articles this member signs. Required as soon as they sign one, or the site build fails.",
      type: "text",
      rows: 3,
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
