import { DocumentIcon } from "@sanity/icons/Document";
import { SearchIcon } from "@sanity/icons/Search";
import { defineField, defineType } from "sanity";
import type { ImageValue } from "sanity";

/**
 * Google cuts titles to the device width and publishes no limit. 60 in total is
 * the usual rule of thumb, and the build appends " · Musi'Quiz <city>"
 * https://developers.google.com/search/docs/appearance/title-link
 */
const TITLE_MAX_LENGTH = 40;

/**
 * a rule of thumb, not a Google limit: snippets are cut to the device width
 * https://developers.google.com/search/docs/appearance/snippet#meta-descriptions
 */
const DESCRIPTION_MAX_LENGTH = 160;

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

export const pageGroups = [
  { name: "content", title: "Content", icon: DocumentIcon, default: true },
  { name: "seo", title: "SEO", icon: SearchIcon },
];

function titleDescription(fallback: string) {
  return `The <title> tag, also sent as og:title. Shown in the browser tab and as the search result headline. The site adds " · Musi'Quiz" and the city after it. ${TITLE_MAX_LENGTH} characters at most. Leave empty to use ${fallback}.`;
}

function descriptionDescription(fallback: string) {
  return `The <meta name="description"> tag, also sent as og:description. The text under the headline in search results and shared links. Say what this page offers that no other page does: Google shows an extract of the page instead when the description is generic. ${DESCRIPTION_MAX_LENGTH} characters at most. Leave empty to use ${fallback}.`;
}

export function ogImageDescription(fallback: string) {
  return `The og:image tag: the picture shown when a page is shared on WhatsApp, Instagram or LinkedIn, and in X (Twitter) previews. ${OG_WIDTH}×${OG_HEIGHT}, or it gets cropped to it from the center. ${fallback}`;
}

const noindexDescription =
  'Adds <meta name="robots" content="noindex, follow">. Keeps this page out of search results; search engines still follow its links, and visitors can still reach it by link.';

function titleWarning(value: string) {
  return value.length > TITLE_MAX_LENGTH
    ? `${value.length} characters, keep it to ${TITLE_MAX_LENGTH}: longer titles get cut off in search results, on phones first.`
    : undefined;
}

function descriptionWarning(value: string) {
  return value.length > DESCRIPTION_MAX_LENGTH
    ? `${value.length} characters, keep it to ${DESCRIPTION_MAX_LENGTH}: longer descriptions get cut off in search results, on phones first.`
    : undefined;
}

type LocalizedEntry = { _key?: string; language?: string; value?: string };

// the value is an array of one entry per language, so `min`/`max` would count languages
function eachLanguage(warning: (value: string) => string | undefined) {
  return (entries?: LocalizedEntry[]) => {
    const messages = (entries ?? []).flatMap((entry) => {
      const message = entry.value ? warning(entry.value) : undefined;

      return message
        ? [`${(entry.language ?? entry._key)?.toUpperCase()}: ${message}`]
        : [];
    });

    return messages.length ? messages.join(" ") : true;
  };
}

function plain(warning: (value: string) => string | undefined) {
  return (value?: string) => (value && warning(value)) || true;
}

// asset ids carry the original size: image-<hash>-1200x630-jpg
export function ogImageWarning(value?: ImageValue) {
  const size = value?.asset?._ref.match(/-(\d+)x(\d+)-\w+$/);

  if (!size) return true;

  const width = Number(size[1]);
  const height = Number(size[2]);
  const ratio = width / height;
  const expected = OG_WIDTH / OG_HEIGHT;

  if (width < OG_WIDTH || Math.abs(ratio - expected) / expected > 0.05) {
    return `${width}x${height}. Use ${OG_WIDTH}x${OG_HEIGHT}, or the networks crop it.`;
  }

  return true;
}

export const seoType = defineType({
  name: "seo",
  title: "Search and sharing",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: titleDescription("the page cover heading"),
      type: "internationalizedArrayString",
      validation: (rule) => rule.custom(eachLanguage(titleWarning)).warning(),
    }),
    defineField({
      name: "description",
      title: "Description",
      description: descriptionDescription("the page cover sub heading"),
      type: "internationalizedArrayText",
      validation: (rule) =>
        rule.custom(eachLanguage(descriptionWarning)).warning(),
    }),
    defineField({
      name: "ogImage",
      title: "Sharing image",
      description: ogImageDescription(
        "Leave empty to use the venue's sharing image, else the one in Site Settings.",
      ),
      type: "image",
      validation: (rule) => rule.custom(ogImageWarning).warning(),
    }),
    defineField({
      name: "noindex",
      title: "Hide from search engines",
      description: noindexDescription,
      type: "boolean",
      initialValue: false,
    }),
  ],
});

// french only, plain strings on purpose: docs/adr/0013
export const blogSeoType = defineType({
  name: "blogSeo",
  title: "Search and sharing",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: titleDescription("the title"),
      type: "string",
      validation: (rule) => rule.custom(plain(titleWarning)).warning(),
    }),
    defineField({
      name: "description",
      title: "Description",
      description: descriptionDescription(
        "the excerpt, or the intro on the blog page",
      ),
      type: "text",
      rows: 3,
      validation: (rule) => rule.custom(plain(descriptionWarning)).warning(),
    }),
    defineField({
      name: "ogImage",
      title: "Sharing image",
      description: ogImageDescription(
        "Leave empty to use the cover on an article, else the one in Site Settings.",
      ),
      type: "image",
      validation: (rule) => rule.custom(ogImageWarning).warning(),
    }),
    defineField({
      name: "noindex",
      title: "Hide from search engines",
      description: noindexDescription,
      type: "boolean",
      initialValue: false,
    }),
  ],
});
