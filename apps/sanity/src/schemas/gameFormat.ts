import { defineField, defineType } from "sanity";
import { JoystickIcon } from "@sanity/icons/Joystick";

const MAX_SIGNATURE_GAMES = 4;

export const gameFormatType = defineType({
  name: "gameFormat",
  title: "Game format",
  type: "document",
  icon: JoystickIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      description:
        "Where this game sits wherever games are listed. Lower comes first. The order is the same at every venue.",
      type: "number",
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: "signature",
      title: "Signature game",
      description:
        'Listed under "Nos expériences" in the main site header and in the footer. Between 1 and 4 games must be signature games.',
      type: "boolean",
      initialValue: false,
      validation: (rule) =>
        rule.custom(async (value, context) => {
          const publishedId = (context.document?._id ?? "").replace(
            /^drafts\./,
            "",
          );
          // other drafts are not counted: only published games reach the site
          const others = await context
            .getClient({ apiVersion: "2025-02-06" })
            .fetch<number>(
              `count(*[_type == "gameFormat"
                && signature == true
                && !(_id in path("drafts.**"))
                && _id != $publishedId])`,
              { publishedId },
            );
          const total = others + (value ? 1 : 0);

          if (total > MAX_SIGNATURE_GAMES)
            return `${others} games are already signature games. The header and footer show at most ${MAX_SIGNATURE_GAMES}.`;
          if (total < 1) return "At least one game must be a signature game.";
          return true;
        }),
    }),
    defineField({
      name: "image",
      title: "Image",
      description:
        "The picture shown beside this game's prices, wherever it is priced. The same image is used at every venue.",
      type: "imageWithAlt",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      description:
        'How the game name will appear in a URL. Use the "Generate" button.',
      validation: (rule) => rule.required(),
      hidden: ({ document }) => !document?.name,
      // once the slug is published, it cant be edited anymore
      readOnly: ({ document }) => {
        const id = document?._id;
        return !id?.startsWith("drafts.");
      },
      options: {
        source: "name",
      },
    }),
  ],
  preview: {
    select: { title: "name" },
  },
});
