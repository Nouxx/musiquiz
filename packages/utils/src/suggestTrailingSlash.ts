import { PRODUCTION_SITE_URL } from "./productionSiteUrl";

const siteHost = new URL(PRODUCTION_SITE_URL).host;

/** the url with the slash its path is missing, or undefined when it is fine or not on this site */
export function suggestTrailingSlash(url: string): string | undefined {
  const match = /^(https?:\/\/([^/?#]+))(\/[^?#]*)?(.*)$/i.exec(url);
  if (!match) return undefined;

  const [, origin, host = "", path = "", rest = ""] = match;

  if (host.toLowerCase().replace(/^www\./, "") !== siteHost) return undefined;

  // a file, `/menu.pdf`, is served without a slash
  const isMissingSlash =
    path !== "" && !path.endsWith("/") && !/\.[a-z\d]+$/i.test(path);

  return isMissingSlash ? `${origin}${path}/${rest}` : undefined;
}
