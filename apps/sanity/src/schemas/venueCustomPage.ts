import {
  defineField,
  defineType,
  type Reference,
  type SlugValidationContext,
  type SlugValue,
} from "sanity";
import { DocumentsIcon } from "@sanity/icons/Documents";
import { getReservedCustomPageSlugs } from "@repo/services/routing/getReservedCustomPageSlugs";
import { SANITY_API_VERSION } from "@repo/utils/sanityConfig";
import { pageGroups } from "./shared/seo";
import { requiredInEveryLanguage } from "./shared/localized";

const reservedSlugs = getReservedCustomPageSlugs();

type LocalizedEntry = { language?: string; value?: string };

function frenchTitle(document: unknown) {
  const title = (document as { title?: LocalizedEntry[] } | undefined)?.title;

  return title?.find((entry) => entry.language === "fr")?.value ?? "";
}

async function isUniqueInVenue(slug: string, context: SlugValidationContext) {
  const { document, getClient } = context;
  const venueRef = (document?.venue as Reference | undefined)?._ref;

  if (!document || !venueRef) return true;

  const id = document._id.replace(/^drafts\./, "");

  return !(await getClient({ apiVersion: SANITY_API_VERSION }).fetch<boolean>(
    `count(*[_type == "venueCustomPage"
      && venue._ref == $venueRef
      && slug.current == $slug
      && !(_id in [$id, "drafts." + $id])]) > 0`,
    { venueRef, slug, id },
  ));
}

function slugRule(value?: SlugValue) {
  const slug = value?.current;

  if (!slug) return true;
  if (slug.length > 100) return "Use at most 100 characters.";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return "Lowercase letters, digits and single hyphens only.";
  }
  if (reservedSlugs.includes(slug)) {
    return `"${slug}" is already a page of every venue. Pick another slug.`;
  }
  return true;
}

export const venueCustomPageType = defineType({
  name: "venueCustomPage",
  title: "Venue Custom Page",
  type: "document",
  icon: DocumentsIcon,
  groups: pageGroups,
  fields: [
    defineField({
      name: "venue",
      group: "content",
      title: "Venue",
      type: "reference",
      to: [{ type: "venue" }],
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      group: "content",
      title: "Title",
      description:
        "A short name for the page, shown in the breadcrumb and used as the search title when the SEO title is empty.",
      type: "internationalizedArrayString",
      validation: (rule) => rule.custom(requiredInEveryLanguage()),
    }),
    defineField({
      name: "slug",
      group: "content",
      title: "URL slug",
      description:
        'The page lives at /[venue]/[slug]/, the same slug in French and English. Use the "Generate" button. Links already pointing to the old path stop working when you change it.',
      type: "slug",
      options: {
        source: (document) => frenchTitle(document),
        isUnique: isUniqueInVenue,
      },
      validation: (rule) => [rule.required(), rule.custom(slugRule)],
    }),
    defineField({
      name: "pageCover",
      group: "content",
      title: "Page Cover",
      type: "pageCover",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pageComponents",
      group: "content",
      type: "pageComponents",
    }),
    defineField({
      name: "seo",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
      venueTitle: "venue.title",
    },
    prepare({
      title,
      slug,
      venueTitle,
    }: {
      title?: LocalizedEntry[];
      slug?: string;
      venueTitle?: string;
    }) {
      return {
        title: frenchTitle({ title }) || "Untitled page",
        subtitle: [venueTitle, slug && `/${slug}/`].filter(Boolean).join(" — "),
      };
    },
  },
});
