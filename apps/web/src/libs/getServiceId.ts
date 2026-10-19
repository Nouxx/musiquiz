import { getRoutesForLang } from "@repo/services/routing/getRoutesForLang";

/** one id per game, whichever language the page is in */
export function getGameServiceId(site: URL, gameSlug: string) {
  return new URL(`${getRoutesForLang("fr").game(gameSlug)}#service`, site).href;
}

/** one id per venue and game, whichever language the page is in */
export function getVenueGameServiceId(
  site: URL,
  venueSlug: string,
  gameSlug: string,
) {
  return new URL(
    `${getRoutesForLang("fr").venueGame(venueSlug, gameSlug)}#service`,
    site,
  ).href;
}

/** one id per event, whichever language the page is in */
export function getEventServiceId(site: URL, eventSlug: string) {
  return new URL(`${getRoutesForLang("fr").event(eventSlug)}#service`, site)
    .href;
}

/** one id per venue and event, whichever language the page is in */
export function getVenueEventServiceId(
  site: URL,
  venueSlug: string,
  eventSlug: string,
) {
  return new URL(
    `${getRoutesForLang("fr").venueEvent(venueSlug, eventSlug)}#service`,
    site,
  ).href;
}
