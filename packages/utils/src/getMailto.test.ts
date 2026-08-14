import { expect, it } from "vitest";

import { getMailto } from "./getMailto";

it("prefixes the scheme", () => {
  expect(getMailto("contact@musiquiz.fr")).toBe("mailto:contact@musiquiz.fr");
});

it("keeps a plus-addressed mailbox", () => {
  expect(getMailto("contact+paris@musiquiz.fr")).toBe(
    "mailto:contact+paris@musiquiz.fr",
  );
});

it("keeps a subdomain", () => {
  expect(getMailto("contact@mail.musiquiz.co.uk")).toBe(
    "mailto:contact@mail.musiquiz.co.uk",
  );
});
