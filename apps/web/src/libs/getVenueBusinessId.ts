import { getRoutesForLang } from "@repo/services/routing/getRoutesForLang";

/** one id per venue, whichever language the page is in */
export function getVenueBusinessId(site: URL, venueSlug: string) {
  return new URL(
    `${getRoutesForLang("fr").venueHome(venueSlug)}#business`,
    site,
  ).href;
}
