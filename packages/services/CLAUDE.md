# @repo/services

Rationale for every rule below: [ADR 0009](../../docs/adr/0009-sanity-query-modules.md). Do not restate it here.

## The boundary

- **Never import a `Sanity*` type into `pageComponent.types.ts` or `types.ts`.** Those are the contract `apps/web` reads, and they depend on nothing outside this package.
- Write a field's type out by hand there even when a Query Module already holds the same shape. Do not derive it — no `SanityX["field"]`, no `Pick`, no re-export.
- `Sanity*` types belong in two places only: the `getXData.ts` that calls a fetch function, and the `utils/toX.ts` that maps one shape to the other.
- The adapter is what forces the two to agree. If a hand-written type drifts from the Query Module, `toX.ts` stops compiling — that is the intended check.

## Adapters

- One `utils/toX.ts` per named thing, taking `SanityX` and returning `X`.
- `null` becomes `undefined` at this boundary: `data.field ?? undefined`. The contract has no nulls.
- Adapt nested shapes inline when one level deep; give a second level its own `toX.ts`.

## Content, not copy

- Return CMS content. Interface copy — labels, units, accessible names — belongs to `apps/web/src/locales/`, never here.

## Repo style

- Declare functions with `function`. No `const fn = () => {}`.
