import JoystickIcon from "@sanity/icons/Joystick";
import { defineField, defineType } from "sanity";
import type { Path, Reference } from "sanity";

type Offering = {
  _key: string;
  game?: Reference;
  price?: number;
};

export const venueType = defineType({
  name: "venue",
  title: "Venues",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      // todo: add character count
      validation: (rule) => rule.required().max(30),
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      description:
        'How the venue name will appear in a URL. Use the "Generate" button.',
      validation: (rule) => rule.required(),
      hidden: ({ document }) => !document?.title,
      // once the slug is published, it cant be edited anymore
      readOnly: ({ document }) => {
        const id = document?._id;
        return !id?.startsWith("drafts.");
      },
      options: {
        source: "title",
      },
    }),
    defineField({
      name: "offerings",
      title: "Offerings",
      type: "array",
      validation: (rule) =>
        rule.custom((offerings?: Offering[]) => {
          if (!offerings) return true;

          const seen = new Map<string, number>();
          const duplicatePaths: Path[] = [];

          offerings.forEach((offering, index) => {
            const ref = offering?.game?._ref;
            if (!ref) return;

            if (seen.has(ref)) {
              duplicatePaths.push([{ _key: offering._key }, "game"]);
            } else {
              seen.set(ref, index);
            }
          });

          if (duplicatePaths.length === 0) return true;

          return {
            message: "This game has already been selected for this venue",
            paths: duplicatePaths,
          };
        }),
      of: [
        defineField({
          name: "offering",
          title: "Offering",
          type: "object",
          icon: JoystickIcon,
          fields: [
            defineField({
              name: "game",
              title: "Game",
              type: "reference",
              to: [{ type: "gameFormat" }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "price",
              title: "Price",
              type: "number",
              validation: (rule) => rule.required().min(0),
            }),
          ],
          preview: {
            select: {
              title: "game.name",
              subtitle: "price",
            },
            prepare({ title, subtitle }) {
              return {
                title: title ?? "No game selected",
                subtitle: subtitle != null ? `${subtitle}€` : "No price",
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "pageCoverMedia",
      title: "Page Cover Media",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pageCoverHeading",
      title: "Page Cover Heading",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pageCoverSubHeading",
      title: "Page Cover Sub Heading",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "pageCoverBadge",
      title: "Page Cover Badge",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "pageCoverCtaLabel",
      title: "Page Cover CTA Label",
      type: "internationalizedArrayString",
    }),
  ],
});
