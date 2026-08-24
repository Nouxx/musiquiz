# CMS modeling — venue routes

Resolved. Rationale is [ADR 0010](../adr/0010-page-content-lives-in-documents.md); vocabulary is in [CONTEXT.md](../../CONTEXT.md). This file is the implementation plan.

## Model

| Document                   | Fields                                                                                | Serves                                              |
| -------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `venue`                    | slug, title, logo, address, regionCode, googleMapsLink, opening hours ×7, phone, mail | facts only — no page content                        |
| `gameFormat`               | name, slug, `displayOrder`                                                            | —                                                   |
| `eventFormat`              | name, slug, `displayOrder`                                                            | — (new)                                             |
| `venueGame`                | venue→, game→`gameFormat`, price, pageCover, pageComponents                           | `/[venue]/jeux/[game]`                              |
| `venueEvent`               | venue→, event→`eventFormat`, pageCover, pageComponents                                | `/[venue]/evenements/[event]`                       |
| `venuePage`                | venue→, pageType `home\|gift\|book`, pageCover, pageComponents                        | `/[venue]/`, `/[venue]/offrir`, `/[venue]/reserver` |
| `homepage`, `siteSettings` | unchanged                                                                             | site root, chrome                                   |

Removed from `venue`: `offerings[]`, `pageCoverMedia`, `pageCoverHeading`, `pageCoverSubHeading`, `pageCoverBadge`, `pageCoverCtaLabel`.

New shared object type `pageCover` — `media` (`imageWithAlt`), `badge`, `heading`, `subHeading`, `ctaLabel` (all `internationalizedArrayString` except media). No URL field: destinations are code-derived.

## Routes

| French                        | English                      |
| ----------------------------- | ---------------------------- |
| `/[venue]/`                   | `/en/[venue]/`               |
| `/[venue]/jeux/[game]`        | `/en/[venue]/games/[game]`   |
| `/[venue]/evenements/[event]` | `/en/[venue]/events/[event]` |
| `/[venue]/offrir`             | `/en/[venue]/gift`           |
| `/[venue]/reserver`           | `/en/[venue]/book`           |

Slugs are not localized — one `slug` per Format, same segment in both locales. `getRoutesForLang` gains `venueEvent`, and `venueGame` changes from `/${venue}/${game}` to `/${venue}/jeux/${game}`.

Home, gift and book are emitted for every venue; a missing `venuePage` fails the build. Game and event paths come from the documents that exist.

## Uniqueness

- `venuePage` — deterministic `_id`: `venuePage-${venueId}-${pageType}`, built from the venue's document id and created by fixed children in the Studio structure. Duplicates unrepresentable; `venue` and `pageType` are `readOnly` and filled from an initial value template. **Hyphens, never dots** — a dot makes the id multi-segment, and public tokenless reads only see `path("*")`.
- `venueGame` / `venueEvent` — two layers. The `game` reference's `filter` hides formats this venue already has a page for, so the mistake is not available to make; an async document-level `rule.custom` still catches a document drafted before its game was taken, and anchors its message to the `game` field via `path` so the error lands on the input rather than floating at the top of the form. Known hole: two simultaneous drafts of the same pair only collide on publish.

## Studio structure

Extends the existing `apps/sanity/structure.ts` (which already handles the `homepage`/`siteSettings` singletons). Venues become a nested tree:

```
Content
├── Homepage
├── Venues
│   └── Lille
│       ├── Home page      → venuePage-{venueId}-home
│       ├── Gift page      → venuePage-{venueId}-gift
│       ├── Booking page   → venuePage-{venueId}-book
│       ├── Games          → venueGame where venue._ref == lille
│       ├── Events         → venueEvent where venue._ref == lille
│       └── Venue details  → the venue document itself
├── Game formats
├── Event formats
└── Site Settings
```

`venuePage`, `venueGame` and `venueEvent` come out of the top-level `documentTypeListItems()` filter so they are only reachable through their venue.

## Query Modules

Per [ADR 0009](../adr/0009-sanity-query-modules.md).

| Module               | Action                                                            |
| -------------------- | ----------------------------------------------------------------- |
| `venuePage.ts`       | new — `({ lang, venueSlug, pageType })`, backs home + gift + book |
| `venueGamePage.ts`   | new                                                               |
| `venueEventPage.ts`  | new                                                               |
| `venueGameSlugs.ts`  | new — `getStaticPaths`                                            |
| `venueEventSlugs.ts` | new — `getStaticPaths`                                            |
| `venueHomepage.ts`   | delete — absorbed by `venuePage.ts`                               |
| `venueFooter.ts`     | done — `offerings[]` → `venueGame` subquery                       |
| `header.ts`          | done — same game-link change                                      |
| `venueSlugs.ts`      | unchanged                                                         |

Footer/header game list becomes:

```groq
"games": *[_type == "venueGame" && venue._ref == ^._id]
  | order(coalesce(game->displayOrder, 999) asc, game->name asc) {
    "name": game->name,
    "slug": game->slug.current
  }
```

Services mirror one-for-one: `getVenuePageData({ pageType })` replaces `getVenueHomepageData`, plus `getVenueGamePageData`, `getVenueEventPageData`.

## Tracer bullet — shipped

One vertical slice, venue home page only, proving the model end to end.

- `shared/pageCover.ts` object type; `venuePage.ts` document type with the full `pageType` enum
- `venue` stripped of its five `pageCover*` fields (`offerings[]` deliberately left in place — Venue Game is not in this slice, and the footer still reads it)
- `sanity.config.ts` — `venuePage` removed from the create menu, initial value template added
- `structure.ts` — Venues nested, each with "Home page" and "Venue details". Gift, Booking, Games and Events children land with their routes.
- `venuePage.ts` Query Module replaces `venueHomepage.ts`; `getVenuePageData` replaces `getVenueHomepageData`
- `VenueHomepage.astro` renders Page Components for the first time; `VenueHomepage` type becomes `VenuePage` + a reusable `PageCover`

Known consequence: **the venue home page cannot build until a `venuePage` exists for every venue**, which is the Q11 rule working as chosen.

Fixed on the way: `subHeading` was optional in the schema but non-nullable in Zod, so an empty one failed the build. It is now optional on both sides.

Bug found and fixed: the deterministic id was first written with dots (`venuePage.<venueId>.home`), which made the document invisible to the site's tokenless client while looking perfectly fine in the Studio. Ids are composed with hyphens — see the ADR consequence on document id path segments.

## Tracer bullet 2 — gift page, shipped

- routes `[venue]/offrir.astro` and `en/[venue]/gift.astro`, both mounting the same Page with `pageType="gift"`
- `VenueHomepage.astro` → `VenuePage.astro`, `VenueHomepageCover.astro` → `VenuePageCover.astro`: the component takes a `pageType` and serves every fixed page, so the home-specific names no longer described it
- `structure.ts` gains the "Gift page" child
- Lille's gift page seeded in `production`, including a blue Rolling Banner so the Page Component path is exercised on a second page type

Verified through the site's own anonymous client: `home/fr`, `home/en`, `gift/fr`, `gift/en` all resolve, with CTAs pointing at `/lille/reserver` and `/en/lille/book`.

Left open: the gift CTA currently points at the booking page, which is a placeholder — there is no gift purchase flow to send it to yet.

## Tracer bullet 3 — booking page, shipped

- routes `[venue]/reserver.astro` and `en/[venue]/book.astro`, mounting the same Page with `pageType="book"`
- `structure.ts` gains the "Booking page" child, completing the three fixed pages under every venue
- Lille's booking page seeded in `production` with a red Rolling Banner

All three page types verified through the anonymous client, in both locales.

## Tracer bullet 4 — venue game pages, shipped

- `venueGame` document type: venue (readOnly, from the template), game, price, Page Cover, Page Components — with the document-level async uniqueness check on the (venue, game) pair
- `displayOrder` added to `gameFormat`, and set on both formats: Musi'Quiz 0, Pixel Games 1
- `structure.ts` gains a "Games" list per venue, filtered to that venue and creating new games with the venue prefilled
- Query Modules `venueGamePage.ts` and `venueGameSlugs.ts`; services `getVenueGamePageData`, `getVenueGameSlugs`
- routes `[venue]/jeux/[game].astro` and `en/[venue]/games/[game].astro`, both `getStaticPaths` from the authored pairs
- `getRoutesForLang.venueGame` now emits `/[venue]/jeux/[game]` and `/en/[venue]/games/[game]` — the collection segment the plan called for. The footer and header link builders pick this up for free.
- Lille seeded with Musi'Quiz (24€) and Pixel Games (19€), each with a Rolling Banner

Verified anonymously: both pairs resolve in both locales, ordered by `displayOrder`. The uniqueness query returns 0 against the document itself and 1 for a would-be duplicate.

**Decision needed: where the booking page's CTA goes.** `ctaUrl` sends `book` back to the venue home page, which is the one destination that makes no sense on a page whose job is booking — its label reads "Voir les créneaux". The honest options are an anchor to a booking widget that does not exist yet, or dropping the CTA from this page, which means `ctaLabel` stops being required on `pageCover`. Left as-is deliberately rather than guessed at.

## Offerings removed — shipped

`venue.offerings[]` is gone. The "this venue sells this game" fact now has one home, `venueGame`.

- `header.ts` and `venueFooter.ts` read `*[_type == "venueGame" && venue._ref == ^._id]` ordered by `game->displayOrder`, projecting `name` and `slug` flat. The footer's `offerings` key becomes `games`, so `getVenueFooterData` maps game objects directly instead of reaching through `offer.game`.
- `venue.ts` loses the `offerings` field, its "Offerings" group, the `Offering` type and the duplicate-game `rule.custom` — that guarantee lives on `venueGame` now.
- Price moved with it: `venueGame.price` is the only place a price is authored.

Consequence: a venue's games are whatever `venueGame` documents exist for it. Venues other than Lille have none yet, so their header and footer game lists render empty until those documents are authored. Old `offerings` data still sits on the venue documents in `production` as an unknown field — invisible in the Studio, read by nothing.

## Sequence

Site is not in production; old fields are deleted in the same change, no deprecation window.

1. Schema: `pageCover` object, `eventFormat`, `venuePage`, `venueGame`, `venueEvent`; `displayOrder` on both Formats; strip the six fields off `venue`.
2. Studio structure: venue-nested tree with the three fixed children.
3. Content (yours): create the 5 home pages from the existing covers, ~8 venue games from the offerings, and author the 10 gift/book pages. Resolve the Lille draft first — it carries an offering the published document does not.
4. Query Modules + services.
5. Routes: `getRoutesForLang` entries, then the ten Route files (five shapes × two locales), Pages, and Feature Components.

Step 3 blocks step 5 from building — the 15 `venuePage` documents must all exist.

## Open, not blocking

- `price` is on `venueGame` but nothing renders it yet. Where it appears on the game page is a design question, not a modeling one.
- Presentation/visual editing has a natural target now that every page is a document. Not scoped here.
- GROQ injection on the preview deployment (ADR 0009 consequence) is untouched by this work and still open.
