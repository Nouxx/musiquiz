# Sanity access is one Query Module per fetch

`@repo/api` held its Sanity layer in four files split by *kind*: every GROQ query in `queries.ts`, every Zod schema in `schema.ts`, every inferred type in `types.ts`, and the fetch helper in `fetchData.ts`. A query, the schema that parses its response, and the type that describes it are one contract — change a projection and all three must move together. Splitting them by kind meant three files opened for every content change, and `types.ts` existed only to re-export `z.infer` of something one directory away.

A **Query Module** is that contract in one file: `packages/api/src/sanity/<name>.ts` holds the GROQ query, the Zod schema, the inferred `Sanity*` type, and the fetch function built from them. There is one per fetch, named after the fetch, mirroring one `getXData.ts` in `@repo/services`. Answering "which file backs `getVenueFooterData`?" needs no search, and a projection edit is a single-file diff where the schema that must follow it is on screen.

The module exports the **fetch function**, not its parts. `fetchVenueFooter({ config, lang, venueSlug })` replaces the four-line `fetchSanityData({ query, schema, config })` wiring that every service function repeated. The schema never crosses the package boundary; only the fetch function and the `Sanity*` type do. That is what makes the package name honest — `@repo/api` exposes calls, not query fragments — and it leaves services doing the one job they are for: adapting `SanityFooter` into `Footer`.

Values reach GROQ by **string interpolation**, not GROQ parameters. A query is a function of the values it needs — `footerQuery({ lang })` — and so is every shared projection. The reason is that TypeScript checks interpolation and cannot check parameters: `${lang}` fails to compile if `lang` is not a `Lang`, whereas a `parameters: { lang }` object paired with a query reading `$lang` is checked by nothing, and a renamed key surfaces as a runtime GROQ error rather than a red squiggle. Every value spliced in today is either a closed union or a slug, so the compiler carries most of the weight.

Parameters were tried and reverted. Two of the three arguments for them do not apply here: distinct query strings defeat caches keyed on query text, but `client.ts` sets `useCdn: false` on purpose; and constant query text is what `sanity typegen` needs, which `apps/sanity/sanity.cli.ts` records as unwanted. The third is real and is recorded below as an accepted risk.

The fetch function is **written by hand**, not generated. `fetchSanityData` stays a plain helper taking `query`, `schema` and `config`, and each module wraps it in a short `async function` that names its own arguments:

```ts
export async function fetchFooter({ config, lang }: { config: SanityConfig; lang: Lang }) {
  return fetchSanityData({ query: footerQuery({ lang }), schema: sanityFooterSchema, config });
}
```

A factory was tried first — `defineSanityQuery<{ lang: Lang }>()({ query, schema })` — and removed. It saved those few lines and charged for them: currying, because TypeScript cannot infer the schema while the parameter type is supplied explicitly; a `Record<never, never>` default for the module that takes no arguments; a rest-spread over a generic that did not typecheck against the client's conditional params overload; and an exception to the repo's own rule that functions are declared with `function`. The wrapper is the thing everyone already knows how to read.

`shared/` is **closed**. It holds `image.ts` and `pageComponents.ts` and gains nothing else without an ADR. Both are named domain objects — a CMS Image and a Page Component — used across most modules, with a shape fixed by something other than the page asking for it. Everything else stays duplicated across Query Modules on purpose: schemas are `z.strictObject`, so a shared projection is a coupling, not a dedup. Adding a field to a shared fragment forces the key into every schema that uses it or `parse` throws at build. The footer and the venue footer both project the site's social URLs today; sharing that block would mean a Bluesky link on the venue footer editing the site footer's schema. Each Query Module keeps full freedom to ask for exactly the fields its page needs, and a surgical change stays surgical.

## Alternative: keep the schema exported and let services fetch

The previous shape, with the split reversed but `fetchSanityData` still public and taking a schema. It leaves consumers able to parse a payload they obtained some other way — fixtures, a preview webhook, a test double — which the chosen shape does not.

It was not chosen because nothing needs that today and the cost is paid on every call: six service functions each importing a helper, a schema, and a query to assemble one fetch. **Revisit it if** a second source of the same payload appears, at which point the module can export its schema alongside the fetch function without changing any call site.

## Alternative: group by Sanity document type

`siteSettings.ts`, `venue.ts`, `homepage.ts`. Rejected outright: queries are cross-document by design — the footer query reads `siteSettings` and `gameFormat` in one request — so no file could own a query without owning documents it does not name.

## Consequences

- **Interpolation makes GROQ injection reachable on the preview deployment, and this is accepted here rather than fixed here.** `apps/web/astro.config.mjs` builds preview with `output: "server"`, no route sets `prerender`, so Astro skips `getStaticPaths` and `Astro.params.venue` is an arbitrary URL segment that reaches `slug.current == "${venueSlug}"` unchecked. A segment containing `"` closes the literal and the remainder parses as GROQ; the preview client runs `perspective: "drafts"` with a token, so the exposure is an unauthenticated read of unpublished content. The static production build is unaffected — its slugs come from `getVenuesSlugParameters()` at build time. The fix belongs at the route or service boundary, where an unknown venue should 404 anyway, not in a query module. Preview has not shipped yet; `docs/temp/todo.md` tracks it alongside the Cloudflare Access policy that same worker needs.
- **The export map stays `"./*": "./src/*.ts"`, so `client.ts` and `fetchData.ts` are importable from anywhere.** Privacy here is convention, not enforcement. Bypassing Zod by reaching for the raw client is a deliberate act that shows up in review as unshaped data; an explicit export map would cost a `package.json` edit per module and be forgotten exactly once.
- **`defineQuery` from `groq` is called once per module and does nothing at runtime.** Typegen is off — `apps/sanity/sanity.cli.ts` records why — so it is kept for the Sanity VS Code extension's GROQ highlighting and to keep the typegen door open. It used to be called a second time inside the fetch helper, which was twice nothing.
- **Duplication between `footer.ts` and `venueFooter.ts` is expected and must not be refactored away.** Same for the game-link projection shared by `venueFooter.ts` and `header.ts`. The rule for promoting a fragment to `shared/` is a name in this glossary, not a repeat count.
- **`fetchSanityData` survives the migration.** It is the shared helper every module's fetch function calls, not dead weight to delete with `queries.ts`. Its falsy-response guard is unchanged: an empty array is truthy, so a dataset with no venues still parses to `[]` rather than throwing.
- **"Feature" was avoided as the folder and module name.** CONTEXT.md already spends it on Feature Component, and the modules sit flat in `src/sanity/` so the import path reads `@repo/api/sanity/footer`.
