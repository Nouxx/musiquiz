import { anchors } from "@repo/services/routing/anchors";
import { defineField } from "sanity";

const anchorPattern = /^[a-z0-9-]+$/;

const reservedAnchors = new Set<string>(Object.values(anchors));

function validAnchor(value?: string) {
  if (!value) return true;
  if (!anchorPattern.test(value)) {
    return "Only lowercase letters, digits and dashes, e.g. nos-tarifs.";
  }
  if (reservedAnchors.has(value)) {
    return `The site already uses #${value}: pick another anchor.`;
  }
  return true;
}

export const anchorField = defineField({
  name: "anchor",
  title: "Anchor",
  description:
    "Optional. Lowercase letters, digits and dashes, e.g. nos-tarifs. Links to this block as /page/#nos-tarifs. Listed in Site URLs once published. Must be unique on the page.",
  type: "string",
  validation: (rule) => rule.custom(validAnchor),
});

export function withAnchor(subtitle: string | undefined, anchor?: string) {
  return [subtitle, anchor && `#${anchor}`].filter(Boolean).join(" · ");
}
