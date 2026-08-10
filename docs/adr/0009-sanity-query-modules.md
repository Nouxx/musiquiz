# Sanity access is one Query Module per fetch

`@repo/api` held its Sanity layer in four files split by *kind*: every GROQ query in `queries.ts`, every Zod schema in `schema.ts`, every inferred type in `types.ts`, and the fetch helper in `fetchData.ts`. A query, the schema that parses its response, and the type that describes it are one contract — change a projection and all three must move together. Splitting them by kind meant three files opened for every content change, and `types.ts` existed only to re-export `z.infer` of something one directory away.

A **Query Module** is that contract in one file: `packages/api/src/sanity/<name>.ts` holds the GROQ query, the Zod schema, the inferred `Sanity*` type, and the fetch function built from them. There is one per fetch, named after the fetch, mirroring one `getXData.ts` in `@repo/services`. Answering "which file backs `getVenueFooterData`?" needs no search, and a projection edit is a single-file diff where the schema that must follow it is on screen.

The module exports the **fetch function**, not its parts. `fetchVenueFooter({ config, lang, venueSlug })` replaces the four-line `fetchSanityData({ query, schema, config })` wiring that every service function repeated. The schema never crosses the package boundary; only the fetch function and the `Sanity*` type do. That is what makes the package name honest — `@repo/api` exposes calls, not query fragments — and it leaves services doing the one job they are for: adapting `SanityFooter` into `Footer`.

Values reach GROQ as **parameters**, never string interpolation. Queries used to splice their arguments into the query text (`slug.current == "${venueSlug}"`), which made every language and every venue a distinct query string that the Sanity CDN caches separately, and made the text opaque to `sanity typegen` should that decision ever be revisited. It was also GROQ injection in shape: not exploitable today — slugs come from `getVenueSlugs()` against our own dataset at build time, and GROQ is read-only — but one route change away from being fed a URL segment, and that route change would not look dangerous. With `$lang` and `$venueSlug` the query text is constant, so queries are `const` strings rather than functions returning template literals, and the shared projections are constants too.

Binding the parameters to the query is the job of `defineSanityQuery<TArgs>()({ query, schema })`. The currying exists because TypeScript cannot infer one type argument while another is supplied explicitly, and the schema must stay inferred. Args are typed per module — `venueSlugs` takes none, `homepage` takes `lang`, `venueFooter` takes `lang` and `venueSlug` — so a caller cannot pass `slug` where the query reads `$venueSlug`.

`shared/` is **closed**. It holds `image.ts` and `pageComponents.ts` and gains nothing else without an ADR. Both are named domain objects — a CMS Image and a Page Component — used across most modules, with a shape fixed by something other than the page asking for it. Everything else stays duplicated across Query Modules on purpose: schemas are `z.strictObject`, so a shared projection is a coupling, not a dedup. Adding a field to a shared fragment forces the key into every schema that uses it or `parse` throws at build. The footer and the venue footer both project the site's social URLs today; sharing that block would mean a Bluesky link on the venue footer editing the site footer's schema. Each Query Module keeps full freedom to ask for exactly the fields its page needs, and a surgical change stays surgical.

## Alternative: keep the schema exported and let services fetch

The previous shape, with the split reversed but `fetchSanityData` still public and taking a schema. It leaves consumers able to parse a payload they obtained some other way — fixtures, a preview webhook, a test double — which the chosen shape does not.

It was not chosen because nothing needs that today and the cost is paid on every call: six service functions each importing a helper, a schema, and a query to assemble one fetch. **Revisit it if** a second source of the same payload appears, at which point the module can export its schema alongside the fetch function without changing any call site.

## Alternative: group by Sanity document type

`siteSettings.ts`, `venue.ts`, `homepage.ts`. Rejected outright: queries are cross-document by design — the footer query reads `siteSettings` and `gameFormat` in one request — so no file could own a query without owning documents it does not name.

## Consequences

- **The export map stays `"./*": "./src/*.ts"`, so `client.ts` and `defineSanityQuery.ts` are importable from anywhere.** Privacy here is convention, not enforcement. Bypassing Zod by reaching for the raw client is a deliberate act that shows up in review as unshaped data; an explicit export map would cost a `package.json` edit per module and be forgotten exactly once.
- **`defineQuery` from `groq` is called once per module and does nothing at runtime.** Typegen is off — `apps/sanity/sanity.cli.ts` records why — so it is kept for the Sanity VS Code extension's GROQ highlighting and to keep the typegen door open. It used to be called a second time inside the fetch helper, which was twice nothing.
- **Duplication between `footer.ts` and `venueFooter.ts` is expected and must not be refactored away.** Same for the game-link projection shared by `venueFooter.ts` and `header.ts`. The rule for promoting a fragment to `shared/` is a name in this glossary, not a repeat count.
- **`fetchSanityData`'s falsy-response guard moved into the factory unchanged.** An empty array is truthy, so a dataset with no venues still parses to `[]` rather than throwing.
- **"Feature" was avoided as the folder and module name.** CONTEXT.md already spends it on Feature Component, and the modules sit flat in `src/sanity/` so the import path reads `@repo/api/sanity/footer`.
