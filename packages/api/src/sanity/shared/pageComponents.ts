import type { Lang } from "@repo/utils/lang";
import { z } from "zod";

function rollingBannerProjection({ lang }: { lang: Lang }) {
  return `
    _type == "rollingBanner" => {
      "message": message[language == "${lang}"][0].value,
      "color": coalesce(color, "red")
    }
  `;
}

function dummyComponentProjection() {
  return `
    _type == "dummyComponent" => {
      text
    }
  `;
}

export function pageComponentsProjection({ lang }: { lang: Lang }) {
  return `
    pageComponents[]{
      _type,
      ${rollingBannerProjection({ lang })},
      ${dummyComponentProjection()},
    }
  `;
}

const sanityRollingBannerSchema = z.strictObject({
  _type: z.literal("rollingBanner"),
  message: z.string().min(1),
  color: z.enum(["red", "blue"]),
});

const sanityDummyComponentSchema = z.strictObject({
  _type: z.literal("dummyComponent"),
  text: z.string().min(1),
});

export const sanityPageComponentSchema = z.discriminatedUnion("_type", [
  sanityRollingBannerSchema,
  sanityDummyComponentSchema,
]);

export type SanityPageComponent = z.infer<typeof sanityPageComponentSchema>;
