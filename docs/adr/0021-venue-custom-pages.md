# Venue Custom Pages

A Venue needs pages beyond its fixed screens (home, booking, gifting, one per Game and Event): a seasonal offer, a partnership, a page for a QR code. Menus do not link them. Editors link them from authored content.

The content is a **Venue Custom Page** (`venueCustomPage`). It is a document of its own with the Venue Event shape: a read-only Venue reference, a localized `title`, a `slug`, a Page Cover with authored calls to action, Page Components and SEO. The Studio lists them under each Venue, and the Site URLs tool lists their paths, labelled by title. The route is the venue layout, with the Venue footer and the breadcrumb Home › Venue › title. Like every venue page, it is indexed and in the sitemap unless `noindex` is set.

**The path is `/[venue]/[slug]/`, with no prefix**, and `/en/[venue]/[slug]/` in English. The slug is the same in both languages, the way a Format's slug is, and both languages are required. Astro serves a static segment before a dynamic one. A slug equal to `reserver` would therefore be shadowed by the booking page, with no error. The slug is rejected when it matches the first segment of any other venue route in either language. That list is derived from `getRoutesForLang` (`getReservedCustomPageSlugs`), so a new venue route reserves its segment without anyone editing a list.

The `title` exists because the cover heading is marketing copy and too long for a breadcrumb or a search title. It is the slug source and the SEO title fallback.

## Alternative: a fourth `pageType` on Venue Page

Rejected. A Venue Page has a deterministic id per type, which keeps exactly one home, gift and booking page per Venue. Custom pages come in any number.

## Alternative: a prefixed path, `/[venue]/infos/[slug]/`

No collision is possible, so no reserved list is needed. Rejected because it adds a segment that means nothing, in every link and every search result. The reserved list costs one function and one test.

## Alternative: one slug per language

Rejected, for the same reason Formats have one slug: per-language slugs need a localized slug type, uniqueness checked per language, and alternates resolved per document. That cost buys an English word in English URLs and nothing else.

## Consequences

- **Renaming a slug or deleting a page breaks every link to it.** Links are typed strings, not references, and there are no redirects. The slug field says so; per [ADR 0020](./0020-studio-lists-the-site-urls.md), the Studio guides editors and does not refuse them.
- A missing `en` value fails the build, as on every other venue page.
- Two Query Modules: `venueCustomPage`, `venueCustomPageSlugs`.
