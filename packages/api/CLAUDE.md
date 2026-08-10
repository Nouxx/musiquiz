# @repo/api

Rationale for every rule below: [ADR 0009](../../docs/adr/0009-sanity-query-modules.md). Do not restate it here.

## Query Modules

- One Query Module per fetch, flat in `src/sanity/<name>.ts`, named after the fetch. It mirrors one `getXData.ts` in `@repo/services`.
- A module holds four things in this order: the query, the schema, the exported type, the exported fetch function.
- Export only the fetch function and the `Sanity*` type. Keep the query and the schema module-private.
- Name them `<name>Query`, `sanity<Name>Schema`, `Sanity<Name>`, `fetch<Name>`. camelCase for schemas — they are values.
- Keep the `Sanity` prefix on types. `@repo/services` owns the unprefixed names.
- Never name anything `fetch*` unless it hits the network.

## Queries

- Interpolate values into the query text. A query is a `function` of the values it needs, and so is a shared projection. No GROQ params — see the ADR.
- Interpolate only closed unions and slugs. Anything free-form needs validating at the service boundary first.
- Wrap query text in `defineQuery` from `groq`, once.
- Write the fetch function by hand: an `async function` taking `{ config, … }` that returns `fetchSanityData({ query, schema, config })`.
- Use `z.strictObject`.

## shared/

- `shared/` is closed at `image.ts` and `pageComponents.ts`. Adding a third entry needs an ADR.
- Duplicate projections across Query Modules freely. Each module asks for exactly the fields its page needs.
- A shared entry keeps its projection, schema, and type in one file, same as a Query Module.

## Repo style

- Declare functions with `function`. No `const fn = () => {}`.
