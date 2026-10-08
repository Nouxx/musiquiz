import { expect, it } from "vitest";

import { getRoutesForLang } from "./getRoutesForLang";

type Route = string | ((first: never, second: never) => string);

function toUrl(route: Route) {
  return typeof route === "string" ? route : route(2 as never, "b" as never);
}

it.each([
  ...Object.entries(getRoutesForLang("fr")),
  ...Object.entries(getRoutesForLang("en")),
])("%s is absolute and ends with a slash", (_, route) => {
  expect(toUrl(route)).toMatch(/^\/(.*\/)?$/);
});
