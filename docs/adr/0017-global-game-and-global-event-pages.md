# Global Game and Global Event pages

A Game Format and an Event Format each get a page no Venue owns: `/jeux/[game]` and `/evenements/[event]`, `/en/games/[game]` and `/en/events/[event]` in English. The global header already linked to these routes before they existed. Each page has the same shape as a Venue Game page: a Page Cover, a Page Component array and SEO fields, wrapped in the global header and footer.

The content is a **Global Game** (`globalGame`) or a **Global Event** (`globalEvent`). Each is a document of its own that references its Format, with the deterministic id `globalGame-${formatId}` / `globalEvent-${formatId}`. The Studio opens it from a fixed "Global page" child under every Format, through an initial value template that fills the read-only reference. This is the Venue Page trick from [ADR 0010](./0010-page-content-lives-in-documents.md): a second page for one Format would need a second document under the same id, so duplicates cannot exist and no uniqueness rule is needed.

The Format's glossary entry said it "carries no marketing copy". That rule was about copy that changes from Venue to Venue. Global copy does not change per Venue, but it still stays off the Format. The reason is ADR 0010's own argument: a Format is a set of facts (name, order, image, signature flag) that every Venue's listings read, and publishing a half-written page must not publish those facts with it.

**Routes come from the Format, not from the page.** A route exists for every game with `signature == true` and for every event. A missing page document fails the build, the same as a missing Venue Page. The header lists exactly those Formats, so a dead header link becomes a red build instead of a 404 a visitor finds. Unticking `signature` removes the route, and the document stays where it is.

**The cover's call to action is decided in code**, the same as on the other Global Pages. It reads "Réserver" / "Book" and leads to the Global Booking Page. The Page Cover hides its authored call to action on both types.

## Alternative: fields on the Format

`pageCover`, `pageComponents` and `seo` added directly to `gameFormat` and `eventFormat`. That means one document fewer and no structure child. Rejected because of draft granularity (see above): the Format is read by every Venue's listings, the header and the footer.

## Alternative: routes derived from documents

A route for every Global Game that exists, the way Venue Game routes work. Rejected because the header's list is driven by `signature`, not by which documents exist. A signature game without a page would be linked from every page of the site and lead to a 404.

## Consequences

- **Ticking `signature` on a game without a page breaks the build.** The Studio shows the "Global page" child under every game, signature or not, so the page can be written before the flag is set.
- **Four Query Modules**: `globalGamePage`, `globalEventPage`, `globalGameSlugs`, `globalEventSlugs`. The slugs modules read the Format, not the page.
- **No JSON-LD beyond breadcrumbs** (Home → name). There is no price and no date to describe.
