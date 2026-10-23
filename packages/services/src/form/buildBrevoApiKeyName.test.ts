import { expect, it } from "vitest";

import { buildBrevoApiKeyName } from "./buildBrevoApiKeyName";

it("names the Brevo secret after the slug", () => {
  expect(buildBrevoApiKeyName("paris")).toBe("BREVO_API_KEY_PARIS");
  expect(buildBrevoApiKeyName("saint-etienne")).toBe(
    "BREVO_API_KEY_SAINT_ETIENNE",
  );
});
