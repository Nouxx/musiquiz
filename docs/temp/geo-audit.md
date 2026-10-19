# GEO audit — apps/web

Generative Engine Optimization: make the site readable, quotable and attributable by AI assistants (ChatGPT search, Claude, Perplexity, Gemini / AI Overviews, Copilot). Scope is code and configuration. Content quality is the client's.

Builds on [`seo-audit.md`](./seo-audit.md). Classic SEO foundations (canonical, hreflang, sitemap, static HTML) already shipped and carry most of the GEO weight: AI search engines read the same HTML, mostly through Bing's and Google's indexes.

## 1. Where we stand

| Area                          | State                                                                                                   | Verdict |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- | ------- |
| HTML served without JS        | Static Astro build, all CMS content in the HTML. AI crawlers do not run JS, so this is the biggest win. | ✓       |
| `robots.txt`                  | `User-agent: * / Allow: /` + sitemap (`src/pages/robots.txt.ts`). Every AI bot allowed, training included (client decision). | ✓       |
| Cloudflare bot settings       | Zone created, set to allow. Re-check on migration day (§2.2).                                           | ⚠ check |
| `llms.txt`                    | Missing.                                                                                                | ✗       |
| JSON-LD                       | Homepage, venue home, breadcrumbs, blog article. Games, events, FAQ components, listings: nothing.      | partial |
| Entity graph                  | `Organization` + `WebSite` on every page (J1). Venue sub-pages still unlinked to their venue (J3).     | partial |
| Freshness signals             | Sitemap `lastmod` and `WebPage.dateModified` from `_updatedAt` (J2).                                    | ✓       |
| Reviews                       | TrustIndex widget, JS-only. Invisible to AI crawlers.                                                   | ✗       |
| Bing indexing                 | ChatGPT search and Copilot lean on Bing. IndexNow on deploy; Bing Webmaster planned (seo-audit Phase 6).  | partial |

## 2. AI crawler access

### 2.1 `robots.txt` — code is fine

`apps/web/src/pages/robots.txt.ts` allows everything. A bot without its own group falls back to `*`, so every search and training bot is allowed.

Client decision: training allowed. Nothing to add: named `Allow` groups would change no crawler's behaviour, and a named group replaces `*` for that bot, so a later `Disallow` on `*` would silently skip it.

Two families of bots, for reference:

| Purpose                                 | User agents                                                                                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Search / answer** (cites, links back) | `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Perplexity-User`, `DuckAssistBot`, `MistralAI-User`, `Bingbot`, `Googlebot` |
| **Training** (no direct traffic)        | `GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `meta-externalagent`, `Amazonbot`, `Bytespider`                                             |

`Google-Extended` and `Applebot-Extended` are robots tokens, not crawlers: blocking them does **not** remove the site from AI Overviews (that runs on `Googlebot`). Never block `Googlebot` or `Bingbot`.

If the decision flips, add one group listing the training bots with `Disallow: /`. Search bots stay on `*`.

Optional: Cloudflare's [Content Signals](https://contentsignals.org/) line (`Content-Signal: search=yes, ai-input=yes, ai-train=yes`) states the same intent in a machine-readable way. Not a standard yet; harmless.

The SSR preview worker keeps `Allow` + `X-Robots-Tag: noindex` (middleware). Correct: a `Disallow` would hide the header.

Checked 2026-10-18:

- [x] Static build `robots.txt`: `User-agent: *`, `Allow: /`, `Sitemap: https://musiquiz.co/sitemap-index.xml` (`musiquiz-static` worker).
- [x] Preview `robots.txt`: same rules, no sitemap, `X-Robots-Tag: noindex, nofollow` on every response (`musiquiz-ssr` worker).

### 2.2 Cloudflare — migration day ⚠

Zone `musiquiz.co` created, AI and bot settings set to allow. Zone settings override the code silently, so re-check them once the nameservers point to Cloudflare.

**Before the nameserver switch**

- [x] Zone created.
- [x] Settings below set to allow.

**On migration day, after the switch** (Security → Bots, AI Crawl Control, Security → WAF)

- [ ] **Block AI bots** / AI Crawl Control: off, or every search bot (§2.1) on "Allow".
- [ ] **Managed robots.txt** ("Instruct AI bot traffic"): off. When on, Cloudflare prepends its own `Disallow` groups to ours.
- [ ] **Bot Fight Mode**: off. It challenges verified AI bots too, and cannot be scoped on the free plan.
- [ ] **Pay per crawl**: off.
- [ ] **WAF custom rules / Under Attack mode**: no rule challenging `cf.verified_bot_category` "AI Crawler" or "Search Engine Crawler".
- [ ] `curl -s https://musiquiz.co/robots.txt` matches the build output byte for byte.
- [ ] Each command below returns `200`:

  ```sh
  curl -sI -A "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)" https://musiquiz.co/paris/
  curl -sI -A "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claude.com/claudebot)" https://musiquiz.co/paris/
  curl -sI -A "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)" https://musiquiz.co/paris/
  ```

**Two weeks after launch**

- [ ] AI Crawl Control dashboard: real crawler hits, mostly `200`. A spoofed UA from a home IP is not a verified bot, so the `curl` checks do not prove the real bot gets through; this dashboard does.

## 3. `llms.txt`

[llms.txt](https://llmstxt.org/) is a Markdown index of the site for language models. Honest status: no major AI provider has said its crawler uses it, and Google says it does not. It costs one endpoint, agents and IDE tools do read it, and it gives a clean, curated map of the site. Worth it, low priority against JSON-LD.

### Design

- **Endpoint** `apps/web/src/pages/llms.txt.ts`, prerendered in the static build, like `robots.txt.ts`. One file at the root; no `/en/llms.txt` (the spec defines one file per site).
- **Source**: the same `get*Slugs` / `get*SiteUrls` functions in `@repo/services` that feed `getStaticPaths` and the Studio's Site URLs tool ([ADR 0020](../adr/0020-studio-lists-the-site-urls.md)). The file cannot list a page the build skips.
- **Text**: titles and descriptions from each document's `seo` field, already written for search. Venues, game formats and event formats get their own `llmsDescription` first, written for assistants: a venue hosted in a partner's premises says so there. A page with `noindex` is left out.
- **Language**: French (default locale). Each entry links the French URL; English URLs in a separate `## English` section.
- **Stays fresh** with the content-publish rebuild already in place.

### Shape

```md
# Musi'Quiz

> Musi'Quiz est un jeu de quiz musical et de blind test en équipe, joué sur un plateau façon jeu TV, dans des salles à Paris, Lille et ailleurs. Réservation en ligne, EVG/EVJF, team building, anniversaires.

## Salles

- [Musi'Quiz Paris](https://musiquiz.co/paris/): <seo.description>
- [Musi'Quiz Lille](https://musiquiz.co/lille/): <seo.description>

## Jeux

- [Musi'Quiz](https://musiquiz.co/jeux/musi-quiz/): <seo.description>
- [Le Maillon Faible](https://musiquiz.co/jeux/le-maillon-faible/): <seo.description>

## Événements

- [EVG / EVJF](https://musiquiz.co/evenements/evg-evjf/): <seo.description>
- [Team building](https://musiquiz.co/evenements/team-building/): <seo.description>

## Pratique

- [Où nous trouver](https://musiquiz.co/ou-nous-trouver/)
- [Réserver](https://musiquiz.co/reserver/)
- [Contact](https://musiquiz.co/contact/)

## Blog

- [<title>](https://musiquiz.co/blog/<slug>/): <excerpt>

## English

- [Musi'Quiz Paris](https://musiquiz.co/en/paris/)
- …

## Optional

- [Mentions légales](https://musiquiz.co/mentions-legales/)
- [CGV](https://musiquiz.co/cgv/)
```

The blockquote summary is the one hand-written sentence. Put it in `siteSettings` (new `llmsSummary` field, fr) rather than in code, so the client owns the wording.

Venue × game and venue × event pages are left out: the venue home already links them, and N cities × M games is noise in a file meant to be short.

### Implementation notes

- One query module per fetch ([ADR 0009](../adr/0009-sanity-query-modules.md)): a `getLlmsTxtData` in `@repo/services` returning `{ summary, venues, games, events, articles }` with `title`, `description`, `slug`. Build URLs with `getRoutesForLang`, never by hand.
- `Content-Type: text/markdown; charset=utf-8`.
- Skip `llms-full.txt` (the whole site concatenated): it duplicates the HTML, goes stale per page, and nobody consumes it for a site this size.
- Add `/llms.txt` to nothing else: it is not a sitemap entry, and `robots.txt` needs no line for it.

## 4. JSON-LD

### 4.1 What exists

| Page                                    | Nodes                                                         | Source                     |
| --------------------------------------- | ------------------------------------------------------------- | -------------------------- |
| Home (fr, en)                           | `Organization` (`#organization`), `WebSite`                   | `HomepageHead.astro`       |
| Venue home                              | `EntertainmentBusiness` (`/<venue>/#business`)                | `VenueHead.astro`          |
| Every page with a canonical             | `WebPage` (`#webpage`), `BreadcrumbList` (`#breadcrumb`)    | `SeoHead.astro`            |
| Blog article                            | `BlogPosting`, `FAQPage` (article FAQ)                        | `BlogArticleHead.astro`    |
| Blog index, where-to-find-us, contact, book, legal | nothing                                            | —                          |

Solid base: stable `@id`s, `</script>` escaping in `JsonLd.astro`, absolute URLs, opening hours parsed from Sanity.

Gaps, by GEO value. AI engines use structured data to resolve *entities* (who is Musi'Quiz, where, how much, for whom) and to check facts against the visible text. The aim is one connected graph per page, every fact the page shows also stated as data.

### 4.2 Recommendations

#### J1 — Site-wide entity anchor (high) — done

`Organization` and `WebSite` render on the homepage only. Venue and article nodes reference `#organization`, which then resolves to nothing on that page; `BlogArticleHead` already works around it by inlining the full publisher.

Emit both on every page from `Layout.astro` (a `SiteGraphHead` beside `SeoHead`), and drop them from `HomepageHead`. Add to `WebSite`: `@id` (`#website`), `inLanguage: ["fr", "en"]`. Then `BlogArticleHead` can go back to `publisher: { "@id": … }`.

Needs the organization data on every page. Today only the homepage fetches it; fetch it once per build (module-level promise, like the `getVenueReviews` cache) rather than once per page.

#### J2 — `WebPage` per page (high) — done

No page says what it *is*. Add one node per page, built in the same `SiteGraphHead`:

```ts
{
  "@type": "WebPage", // ContactPage, CollectionPage, AboutPage, CheckoutPage where it fits
  "@id": `${url}#webpage`,
  url,
  name: fullTitle,
  description,
  inLanguage: lang,
  isPartOf: { "@id": websiteId },
  about: { "@id": venueBusinessId ?? organizationId },
  primaryImageOfPage: ogImageUrl,
  breadcrumb: { "@id": `${url}#breadcrumb` },
  dateModified,
}
```

- Every input is already in `SeoHead` props, except `dateModified`.
- `dateModified`: add `_updatedAt` to each page's query module and to `Seo` in `types.ts`. Same value feeds the sitemap (§5.1). AI answer engines weigh freshness.
- Give `toBreadcrumbList` an `@id` (`#breadcrumb`) so the page can point to it.
- Page types: `/contact/` → `ContactPage`; `/blog/` and `/ou-nous-trouver/` → `CollectionPage`; booking/gift → `WebPage` (`CheckoutPage` implies payment on-site, and it runs in a partner widget).

Shipped: `SeoHead` emits `WebPage` (`libs/toWebPage.ts`) and the `BreadcrumbList` from a `breadcrumbs` prop on `Layout`; `BreadcrumbHead` is gone. `updatedAt` comes from `seoProjection` (`_updatedAt`); the venue home takes the newer of page and venue, like the sitemap. A page without a canonical (404, 500) emits neither.

#### J3 — Venue business on every venue page (high)

`EntertainmentBusiness` is on the venue home only. Venue game, event, custom, booking and gift pages do not say which venue they belong to.

- Venue home: keep the full node. Add `image` (page cover / OG image), `logo` (venue logo, in `VenueHeader` data), `description` (`seo.description`), `currenciesAccepted`, `knowsLanguage: ["fr", "en"]` where true.
- Every other venue page: a short node `{ "@type": "EntertainmentBusiness", "@id": venueBusinessId, name, url: venueHomeUrl }`, plus `about` on its `WebPage` (J2). Move this into `VenueLayout` so no page can forget it.
- Organization side: `subOrganization: venues.map(({ slug }) => ({ "@id": getVenueBusinessId(site, slug) }))` in J1, so the brand and its venues link both ways.
- Do **not** add `aggregateRating` from the Google Places rating. Google's policy forbids review markup aggregated from another site and ignores self-served stars on `LocalBusiness`; a mismatch with Google's own data is a trust signal against the site. Show the rating as visible text instead (§5.3).

#### J4 — Games as `Service` with `Offer`s (high)

Game pages carry the facts people ask assistants: what it is, how many players, how much. Today, none of it is in data.

- Venue game page (`/[venue]/jeux/[game]/`): `Service` with `@id` `${url}#service`, `name: gameName`, `description: seo.description`, `image`, `provider: { "@id": venueBusinessId }`, `areaServed: city`, and `offers` built from the page's `gamePrices` component:

  ```ts
  function toOffers(game: PricesGame, url: string) {
    return game.prices.map((price) => ({
      "@type": "Offer",
      name: price.label,
      description: price.caption,
      price: price.amount,
      priceCurrency: price.currency,
      url,
    }));
  }
  ```

  The price component renders the same data on screen, so the markup cannot drift from what users see.
- Global game page (`/jeux/[game]/`): `Service` with `provider: { "@id": organizationId }`, no offers (prices are per venue), and `areaServed` listing the venues' cities.
- Venue home: `hasOfferCatalog` from the `venuePrices` component, one `OfferCatalog` item per game pointing to the venue game `Service` `@id`.
- Tier labels like "De 4 à 6 joueurs" hold the group size as text. If the client wants assistants to answer "how many players", a structured `minPlayers`/`maxPlayers` on the game document would allow `eligibleQuantity` on each `Offer`. Schema change; only if the client agrees to fill it.
- Not `Product`: Google's merchant rules for `Product` (shipping, returns) do not fit a booked activity. Not `Game` / `VideoGame`: those describe a game as a work, not an experience sold at a venue.

#### J5 — Events as `Service`, not `Event` (medium)

EVG/EVJF, team building and Musi'Teens are formats, not dated happenings. `Event` requires `startDate`; using it without real dates is misuse and gets the markup ignored.

Same shape as J4: `Service`, `serviceType: eventName`, `audience` (`{ "@type": "Audience", audienceType: "Entreprises" }` for team building, `PeopleAudience` with `suggestedMinAge`/`suggestedMaxAge` for Musi'Teens: needs data, else skip), `provider` venue or organization, `offers` when the page has an `offers` component with priced cards (skip `quotation` prices).

#### J6 — `FAQPage` from every `faq` component (medium)

The `faq` page component renders Q&As on venue, game and event pages with no markup. Only the blog article's own FAQ is marked up.

seo-audit D5 said "do not add more": right for Google rich results (restricted to government/health since 2023). For GEO it reverses: question/answer pairs are the format assistants lift most directly, and markup marks them unambiguously.

- Move the `faqPage` builder and `plainText` out of `BlogArticleHead.astro` into `libs/toFaqPage.ts`, with a test like `toBreadcrumbList.test.ts`.
- Call it from `PageComponentsHead.astro`, which already receives every page's components (and already handles the `reviews` preconnect). One page, one `FAQPage`: if a page holds two `faq` components, merge their questions.
- Give it `@id` `${url}#faq` and reference it from the `WebPage` via `mainEntity` only on pages whose purpose is the FAQ (none today); otherwise just `isPartOf`.

#### J7 — Blog listing and article (medium)

- `/blog/` and `/blog/page/N/`: `Blog` node (`@id` `/blog/#blog`, `publisher` `#organization`, `inLanguage: "fr"`) + `ItemList` of the listed articles' URLs.
- `BlogPosting`: add `@id` (`#article`), `isPartOf: { "@id": blogId }`, `timeRequired: \`PT${data.readingMinutes}M\``, `about` → the closing venue's `#business` when `closesOn.kind === "venue"`, `author.sameAs` if the author schema gets social links.
- Author entity: a `Person` with a stable `@id` (`/blog/#author-<slug>`) once there is an author page; until then, keep inline.

#### J8 — Where to find us (low)

`ItemList` of venues, each item `{ "@id": venueBusinessId }` with `url`, `name`, `address`. Gives assistants the full venue list in one fetch, answering "where can I play Musi'Quiz".

#### J9 — Structure and tests (low)

- Keep `JsonLd.astro` as the single emitter. A page renders several `<script type="application/ld+json">` blocks (site graph, venue, breadcrumb, FAQ); valid, and `@id`s link across blocks. No need to merge them.
- Builders return plain objects from `libs/to*.ts` and get unit tests, as `toBreadcrumbList` does. The tests check `@id` wiring, absolute URLs and omitted-when-empty fields.
- Optional type safety: [`schema-dts`](https://www.npmjs.com/package/schema-dts) (Google's types) on builder return types. Dev dependency only, catches misspelled properties.
- Validate a sample of each template in [validator.schema.org](https://validator.schema.org/) (all types) and the [Rich Results Test](https://search.google.com/test/rich-results) (Google-eligible types) before launch. Add to the pre-launch Screaming Frog crawl: it extracts and validates JSON-LD per page.

## 5. Other code and configuration

### 5.1 Sitemap `lastmod` (high) — done

`@astrojs/sitemap` is replaced by `src/pages/sitemap.xml.ts`, prerendered in the static build and 404 in the preview build, like `llms.txt`.

- The list comes from the `get*SiteUrls` services, the same source as `llms.txt` and the Studio tool. A URL with no page document fails the build.
- `<lastmod>` is the page document's `_updatedAt` (`fetchSitemap`). Shared documents (venue, game format, header) do not bump it.
- `noindex` pages are left out. So is `/blog/page/N/`: the articles are listed directly.
- Each fr/en pair carries `xhtml:link` alternates, the same as the HTML hreflang.
- One `/sitemap.xml`, no index file: one file holds 50,000 URLs. `robots.txt` points to it. Submit `/sitemap.xml` in Search Console and Bing Webmaster.

### 5.2 IndexNow on deploy (medium) — done

ChatGPT search, Copilot and DuckDuckGo read Bing's index. [IndexNow](https://www.indexnow.org/) pushes changed URLs to Bing (and Yandex, Seznam, Naver) in seconds instead of waiting for a recrawl. Google does not use it.

- Key: `KEY` in `scripts/submitIndexNow.js`, served as `apps/web/public/<key>.txt` (public by design). The script fails if the built file is missing or holds another key. Rotating means changing both.
- `deploy:static` runs `scripts/submitIndexNow.js ./dist/static` after `wrangler deploy`: every `<loc>` of the built `sitemap.xml` in one POST to `https://api.indexnow.org/indexnow` (limit 10,000). Covers both triggers, push to `main` and the Studio Deploy tab, with no extra hook.
- A localhost sitemap is skipped. A rejected ping logs a warning and exits 0: the site is already live.
- Until the nameservers switch, `musiquiz.co/<key>.txt` is not served, so the ping is accepted but the key fails verification. Nothing to do; it works from the first deploy after migration.

**After migration**

- [ ] `curl -s https://musiquiz.co/cdbe55213bc1abb790180b15288ffcba.txt` returns the key.
- [ ] Workers Build log of the next deploy shows `✓ N urls submitted to IndexNow`.
- [ ] Bing Webmaster Tools → IndexNow: submitted URLs appear (seo-audit Phase 6).

### 5.3 Reviews visible without JS (medium)

Reviews are TrustIndex widgets (ADR 0026): the HTML holds an empty container, so AI crawlers see no social proof at all. The Google rating and count are already fetched at build for the blog pill (`getVenueReviews`, ADR 0027).

Render them as text in the `reviews` component's static HTML, next to the widget: "4,8/5 · 1 234 avis Google". Visible text, not `aggregateRating` (J3). Copy for the label belongs in `apps/web/src/locales`.

### 5.4 Other JS-only content (low)

- Booking and gift pages: the 4escape widget is JS. Expected, nothing to index. Make sure `componentsBeforeWidget` carries the useful text (opening hours, how booking works) — content, client side.
- Map (Leaflet): JS, but the address is also in HTML (`findUs`). Fine.
- Carousels, tabs (`detailTabs`): confirm hidden panels are in the DOM (hidden with CSS/`hidden`), not injected on click. Quick check with `curl -s <page> | grep "<a game rule text>"`.

### 5.5 Measure AI traffic (low)

- GA4 / GTM (already wired): a referral channel group for `chatgpt.com`, `perplexity.ai`, `claude.ai`, `gemini.google.com`, `copilot.microsoft.com`. ChatGPT search links carry `utm_source=chatgpt.com`.
- Cloudflare AI Crawl Control dashboard: crawl volume per AI bot, status codes. The only place blocked crawls show up.

## 6. Plan

| #  | Item                                                            | Effort | Value  | Needs CMS change            |
| -- | --------------------------------------------------------------- | ------ | ------ | --------------------------- |
| 1  | Cloudflare bot settings, migration-day checklist (§2.2)         | XS     | High   | —                           |
| 2  | ~~`robots.txt`~~ done: training allowed, `*` covers every bot (§2.1) | —  | —      | —                           |
| 3  | ~~J1 site-wide `Organization` + `WebSite`~~ done (`SiteGraphHead` in `Layout`) | S | High | —                |
| 4  | J3 venue node on every venue page + `subOrganization`           | S      | High   | —                           |
| 5  | J4 games as `Service` + `Offer`s                                | M      | High   | optional (player counts)    |
| 6  | J6 `FAQPage` from `faq` components                              | S      | Medium | —                           |
| 7  | ~~J2 `WebPage` + `dateModified`~~ done (`toWebPage` in `SeoHead`) | M | High | —                                   |
| 8  | ~~`llms.txt` endpoint (§3)~~ done; summary drafted, unpublished | S      | Low–Med | `siteSettings.llmsSummary` |
| 9  | J5 events as `Service`                                          | S      | Medium | optional (audience ages)    |
| 10 | Reviews rating as visible text (§5.3)                           | S      | Medium | —                           |
| 11 | ~~IndexNow on deploy (§5.2)~~ done; key verifies after migration | S     | Medium | —                           |
| 12 | J7 blog, J8 where-to-find-us                                    | S      | Low    | —                           |
| 13 | J9 builder tests, schema validation in pre-launch crawl         | S      | —      | —                           |

Order: 1 is configuration, on migration day. 3–4 fix the entity graph everything else hangs from. 7 unlocks freshness in three places at once.
