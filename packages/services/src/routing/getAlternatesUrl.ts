import { getRoutesForLang } from "./getRoutesForLang";

const frenchRoutes = getRoutesForLang("fr");
const englishRoutes = getRoutesForLang("en");

/** `en` is missing on the blog, French only: docs/adr/0013 */
export type Alternates = { fr: string; en?: string };

/**
 * The blog is French only and cannot go through here, see docs/adr/0013
 */
export function getAlternatesUrl(
  site: URL,
  toPath: (routes: typeof englishRoutes) => string,
): Alternates {
  return {
    fr: new URL(toPath(frenchRoutes), site).href,
    en: new URL(toPath(englishRoutes), site).href,
  };
}
