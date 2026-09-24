import { expect, it } from "vitest";

import { isExternalUrl } from "./isExternalUrl";

// eslint-disable-next-line unicorn/prefer-https -- plain http is the case under test
it.each(["https://example.com", "http://example.com"])(
  "flags an absolute web URL (%s)",
  (url) => {
    expect(isExternalUrl(url)).toBe(true);
  },
);

it.each(["/ou-nous-trouver", "#venues-map", "mailto:a@b.c", "tel:0612345678"])(
  "leaves on-site and non-web links alone (%s)",
  (url) => {
    expect(isExternalUrl(url)).toBe(false);
  },
);
