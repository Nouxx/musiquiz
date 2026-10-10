import { suggestTrailingSlash } from "@repo/utils/suggestTrailingSlash";
import type { CustomValidatorResult } from "sanity";

// on the link, not its `href`: every rule of a url field carries a default
// uri() that refuses relative paths, so a second rule there rejects /paris/.
// the path is relative to the link
export function trailingSlashWarning(
  link: { href?: string } | undefined,
): CustomValidatorResult {
  const fixed = link?.href && suggestTrailingSlash(link.href);

  return fixed
    ? {
        message: `End the path with /: ${fixed}. Without it, the page opens through a redirect.`,
        path: ["href"],
      }
    : true;
}
