import { defineField, defineType } from "sanity";

// crop and hotspot are deliberately left off: they only ever apply if the front
// end asks the image pipeline for them, and it does not. enabling the tool here
// would give editors a control that silently does nothing (see adr 0004)
export const ImageWithAltType = defineType({
  name: "imageWithAlt",
  title: "Image",
  type: "image",
  fields: [
    defineField({
      name: "alt",
      title: "Alternative text",
      description:
        "Describes the image for screen readers and when the image fails to load. Leave empty when the image is purely decorative, or when nearby text already says the same thing.",
      type: "internationalizedArrayString",
    }),
  ],
});
