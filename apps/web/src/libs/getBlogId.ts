import { getRoutesForLang } from "@repo/services/routing/getRoutesForLang";

export function getBlogId(site: URL) {
  return new URL(`${getRoutesForLang("fr").blog}#blog`, site).href;
}
