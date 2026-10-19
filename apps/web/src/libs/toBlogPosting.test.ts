import { expect, it } from "vitest";

import { toBlogPosting } from "./toBlogPosting";

const site = new URL("https://musiquiz.co");
const url = "https://musiquiz.co/blog/evjf-paris/";

const article: Parameters<typeof toBlogPosting>[0]["article"] = {
  title: "Un EVJF à Paris",
  excerpt: "Nos idées.",
  publishedAt: "2026-05-01",
  updatedAt: "2026-06-12",
  readingMinutes: 6,
  closesOn: { kind: "event" },
  author: {
    name: "Camille Martin",
    jobTitle: "Game designer",
    profileUrl: "https://www.linkedin.com/in/camille",
  },
};

it("places the article in the blog, published by the organization", () => {
  expect(
    toBlogPosting({
      site,
      url,
      imageUrl: "https://musiquiz.co/_astro/cover.jpg",
      article,
    }),
  ).toEqual({
    "@type": "BlogPosting",
    "@id": "https://musiquiz.co/blog/evjf-paris/#article",
    headline: "Un EVJF à Paris",
    description: "Nos idées.",
    image: "https://musiquiz.co/_astro/cover.jpg",
    datePublished: "2026-05-01",
    dateModified: "2026-06-12",
    inLanguage: "fr",
    timeRequired: "PT6M",
    mainEntityOfPage: url,
    isPartOf: { "@id": "https://musiquiz.co/blog/#blog" },
    author: {
      "@type": "Person",
      name: "Camille Martin",
      jobTitle: "Game designer",
      sameAs: ["https://www.linkedin.com/in/camille"],
    },
    publisher: { "@id": "https://musiquiz.co/#organization" },
  });
});

it("is about the venue it closes on", () => {
  const posting = toBlogPosting({
    site,
    url,
    imageUrl: "https://musiquiz.co/_astro/cover.jpg",
    article: {
      ...article,
      closesOn: { kind: "venue", slug: "paris" },
    },
  });

  expect(posting.about).toEqual({
    "@id": "https://musiquiz.co/paris/#business",
  });
});

it("falls back to the publish date and leaves out a missing profile", () => {
  const posting = toBlogPosting({
    site,
    url,
    imageUrl: "https://musiquiz.co/_astro/cover.jpg",
    article: {
      ...article,
      updatedAt: undefined,
      author: { ...article.author, profileUrl: undefined },
    },
  });

  expect(posting.dateModified).toBe("2026-05-01");
  expect(posting.author).not.toHaveProperty("sameAs");
});
