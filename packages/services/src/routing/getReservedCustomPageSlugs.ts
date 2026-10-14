import { getRoutesForLang } from "./getRoutesForLang";

const VENUE = "venue";
const PAGE = "page";

type Route = string | ((first: never, second: never) => string);

function segmentAfterVenue(route: Route): string[] {
  if (typeof route === "string") return [];

  const [, rest] = route(VENUE as never, PAGE as never).split(`/${VENUE}/`, 2);
  const [segment] = rest?.split("/", 1) ?? [];

  return segment && segment !== PAGE ? [segment] : [];
}

/**
 * A Venue Custom Page at `/[venue]/[page]/` is shadowed by any other venue
 * route whose first segment matches its slug, in either language.
 */
export function getReservedCustomPageSlugs() {
  const routes: Route[] = [
    ...Object.values(getRoutesForLang("fr")),
    ...Object.values(getRoutesForLang("en")),
  ];

  return [...new Set(routes.flatMap((route) => segmentAfterVenue(route)))];
}
