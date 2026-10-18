import type { StringRule } from "sanity";

export function gtmIdValidation(rule: StringRule) {
  return rule
    .regex(/^GTM-[A-Z0-9]+$/)
    .error("Must be a container ID, like GTM-MPTRL2XB");
}
