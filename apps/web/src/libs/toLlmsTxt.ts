import type { LlmsTxt, LlmsTxtPageRoute } from "@repo/services/cms/types";
import type { Lang } from "@repo/utils/lang";

import { getT } from "./i18n";

const pageLabelKeys = {
  book: "header.book",
  whereToFindUs: "footer.whereToFindUs",
  joinTheNetwork: "footer.joinTheNetwork",
  contact: "footer.contact",
  termsAndConditions: "footer.termsAndConditions",
  legalNotice: "footer.legalNotice",
} as const satisfies Record<LlmsTxtPageRoute, string>;

const legalRoutes = new Set<LlmsTxtPageRoute>([
  "termsAndConditions",
  "legalNotice",
]);

function oneLine(text: string) {
  return text.replaceAll(/\s+/g, " ").trim();
}

function toVenueName(lang: Lang, city: string) {
  return getT(lang)("llmsTxt.venueName", { city });
}

function toLine({
  site,
  name,
  path,
  description,
}: {
  site: URL;
  name: string;
  path: string;
  description?: string;
}) {
  const link = `- [${name}](${new URL(path, site).href})`;

  return description ? `${link}: ${oneLine(description)}` : link;
}

function toSection(heading: string, lines: string[]) {
  return lines.length > 0 ? [`## ${heading}`, "", ...lines, ""] : [];
}

export function toLlmsTxt(site: URL, data: LlmsTxt): string {
  const fr = getT("fr");
  const en = getT("en");

  const mainPages = data.pages.filter(({ route }) => !legalRoutes.has(route));
  const legalPages = data.pages.filter(({ route }) => legalRoutes.has(route));

  const englishLines = [
    ...data.venues.flatMap((venue) =>
      venue.en
        ? [
            toLine({
              site,
              name: toVenueName("en", venue.name),
              path: venue.en,
            }),
          ]
        : [],
    ),
    ...[...data.games, ...data.events].flatMap(({ name, en: path }) =>
      path ? [toLine({ site, name, path })] : [],
    ),
    ...mainPages.map(({ route, en: path }) =>
      toLine({ site, name: en(pageLabelKeys[route]), path }),
    ),
  ];

  const lines = [
    "# Musi'Quiz",
    "",
    ...(data.summary ? [`> ${oneLine(data.summary)}`, ""] : []),
    ...toSection(
      fr("llmsTxt.venues"),
      data.venues.map((venue) =>
        toLine({
          site,
          name: toVenueName("fr", venue.name),
          path: venue.fr,
          description: venue.description,
        }),
      ),
    ),
    ...toSection(
      fr("llmsTxt.games"),
      data.games.map(({ name, fr: path, description }) =>
        toLine({ site, name, path, description }),
      ),
    ),
    ...toSection(
      fr("llmsTxt.events"),
      data.events.map(({ name, fr: path, description }) =>
        toLine({ site, name, path, description }),
      ),
    ),
    ...toSection(
      fr("llmsTxt.practical"),
      mainPages.map(({ route, fr: path }) =>
        toLine({ site, name: fr(pageLabelKeys[route]), path }),
      ),
    ),
    ...toSection(
      fr("llmsTxt.blog"),
      data.articles.map(({ name, fr: path, description }) =>
        toLine({ site, name, path, description }),
      ),
    ),
    ...toSection(fr("llmsTxt.english"), englishLines),
    // "Optional" is a keyword of the spec, not copy: https://llmstxt.org/#format
    ...toSection(
      "Optional",
      legalPages.map(({ route, fr: path }) =>
        toLine({ site, name: fr(pageLabelKeys[route]), path }),
      ),
    ),
  ];

  return `${lines.join("\n").trimEnd()}\n`;
}
