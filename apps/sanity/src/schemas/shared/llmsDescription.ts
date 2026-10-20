import { defineField } from "sanity";

export function llmsDescriptionField({
  subject,
  hint,
  fallback,
  group,
}: {
  /** @example "this venue" */
  subject: string;
  /** @example "Say where the games are played, e.g. in a partner venue." */
  hint?: string;
  /** @example "the venue home page's meta description" */
  fallback: string;
  group?: string;
}) {
  return defineField({
    name: "llmsDescription",
    title: "Description for AI assistants",
    description: `One or two sentences in French, listed under ${subject} in the /llms.txt file read by ChatGPT, Claude and other AI assistants. ${hint ? `${hint} ` : ""}Empty, ${fallback} is used.`,
    type: "text",
    rows: 3,
    group,
    validation: (rule) => rule.required().warning(),
  });
}
