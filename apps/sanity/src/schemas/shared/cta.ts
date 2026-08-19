import { defineField, defineType } from "sanity";

type LocalizedEntry = { value?: string };

// `/` a page of this site, `#` a heading further down the page the button sits
// on, `https://` somewhere else entirely. anything else — a bare `www.`, a
// `mailto:`, a path with no leading slash — is a typo, not a destination
const URL_PREFIXES = ["/", "#", "https://"];

export const ctaType = defineType({
  name: "cta",
  title: "Call to action",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      description: "The text on the button.",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "URL",
      description:
        "Where the button leads, once per language. Start with / for a page of this site — including its language prefix, so /en/… for English — with # for a section of the page this button sits on, or with https:// for another site.",
      type: "internationalizedArrayString", // the url is localized because fr and en are different paths
      validation: (rule) =>
        rule.required().custom((entries?: LocalizedEntry[]) => {
          const invalid = entries?.filter(
            (entry) =>
              entry.value &&
              !URL_PREFIXES.some((prefix) => entry.value?.startsWith(prefix)),
          );

          return invalid?.length
            ? "Start with / for a page of this site, # for a section of this page, or https:// for another site"
            : true;
        }),
    }),
  ],
});
