import { z } from "zod";

const rollingBannerProjection = `
  _type == "rollingBanner" => {
    "message": message[language == $lang][0].value
  }
`;

const dummyComponentProjection = `
  _type == "dummyComponent" => {
    text
  }
`;

/**
 * Projects the `pageComponents` array of any document that owns one. Reads
 * `$lang`, so every query embedding it must declare a `lang` param.
 */
export const pageComponentsProjection = `
  pageComponents[]{
    _type,
    ${rollingBannerProjection},
    ${dummyComponentProjection},
  }
`;

const sanityRollingBannerSchema = z.strictObject({
  _type: z.literal("rollingBanner"),
  message: z.string().min(1),
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
