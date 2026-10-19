import { expect, it } from "vitest";

import { toSiteGraph } from "./toSiteGraph";

const site = new URL("https://musiquiz.co");

const graph = toSiteGraph({
  site,
  lang: "en",
  logoUrl: "https://musiquiz.co/_astro/logo.png",
  organization: {
    logo: {
      url: "https://cdn.sanity.io/images/logo.png",
      width: 512,
      height: 512,
      mimeType: "image/png",
      alt: "",
    },
    sameAs: ["https://www.instagram.com/musiquiz"],
    telephone: "+33 1 23 45 67 89",
    email: "hello@musiquiz.co",
    venues: [{ slug: "paris", city: "Paris" }],
  },
});

it("links the organization, the website and each venue both ways", () => {
  expect(graph).toEqual([
    {
      "@type": "Organization",
      "@id": "https://musiquiz.co/#organization",
      name: "Musi'Quiz",
      url: "https://musiquiz.co/",
      logo: "https://musiquiz.co/_astro/logo.png",
      sameAs: ["https://www.instagram.com/musiquiz"],
      telephone: "+33 1 23 45 67 89",
      email: "hello@musiquiz.co",
      subOrganization: [{ "@id": "https://musiquiz.co/paris/#business" }],
    },
    {
      "@type": "WebSite",
      "@id": "https://musiquiz.co/#website",
      name: "Musi'Quiz",
      url: "https://musiquiz.co/",
      inLanguage: ["fr", "en"],
      publisher: { "@id": "https://musiquiz.co/#organization" },
    },
    {
      "@type": "EntertainmentBusiness",
      "@id": "https://musiquiz.co/paris/#business",
      name: "Musi'Quiz Paris",
      url: "https://musiquiz.co/en/paris/",
      parentOrganization: { "@id": "https://musiquiz.co/#organization" },
    },
  ]);
});
