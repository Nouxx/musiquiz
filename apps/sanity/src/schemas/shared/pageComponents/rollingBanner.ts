import { defineArrayMember, defineField, defineType } from "sanity";
import {
  eachLanguage,
  frenchValue,
  type LocalizedEntry,
  requiredInEveryLanguage,
} from "../localized";
import { anchorField, withAnchor } from "../anchorField";

export const rollingBannerMessageType = defineType({
  name: "rollingBannerMessage",
  title: "Message",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Text",
      description: "One short line.",
      type: "internationalizedArrayString",
      validation: (rule) => [
        rule.custom(requiredInEveryLanguage()),
        rule.custom(
          eachLanguage((value) => {
            if (value.length > 70) return "Keep it under 70 characters";
            if (value.length < 8) return "At least 8 characters";
            return undefined;
          }),
        ),
        rule
          .warning()
          .custom(
            eachLanguage((value) =>
              value.length > 55
                ? "Longer than the line this banner was designed for (55 characters)"
                : undefined,
            ),
          ),
      ],
    }),
  ],
  preview: {
    select: { text: "text" },
    prepare({ text }: { text?: LocalizedEntry[] }) {
      return { title: frenchValue(text) ?? "Message" };
    },
  },
});

export const rollingBannerType = defineType({
  name: "rollingBanner",
  title: "Rolling Banner",
  type: "object",
  fields: [
    defineField({
      name: "messages",
      title: "Messages",
      description:
        "Scrolled one after the other across the strip, in this order, then repeated.",
      type: "array",
      of: [defineArrayMember({ type: "rollingBannerMessage" })],
      validation: (rule) => rule.required().min(1).max(5),
    }),
    defineField({
      name: "color",
      title: "Color",
      description: "The color of the strip the messages scroll across.",
      type: "string",
      validation: (rule) => rule.required(),
      initialValue: "red",
      options: {
        list: [
          { title: "Red", value: "red" },
          { title: "Blue", value: "blue" },
        ],
        layout: "radio",
      },
    }),
    anchorField,
  ],
  preview: {
    select: {
      anchor: "anchor",
      messages: "messages",
    },
    prepare({
      anchor,
      messages,
    }: {
      anchor?: string;
      messages?: { text?: LocalizedEntry[] }[];
    }) {
      const count = messages?.length ?? 0;

      return {
        title: frenchValue(messages?.[0]?.text) ?? "Rolling Banner",
        subtitle: withAnchor(
          `Rolling Banner · ${count} message${count === 1 ? "" : "s"}`,
          anchor,
        ),
      };
    },
  },
});
