# The gifting and booking pages bracket their Widget

The gifting and booking pages are not composed the way every other page is. Each one renders a **Widget** — 4escape's catalogue and cart, injected at runtime, styled by us and owned entirely by the build — and the editor's job is to write copy _around_ it. The design puts sections above the Widget and, on the booking page, more sections below it. A single `pageComponents` array cannot express that: it says what the page contains and in what order, and it has no way to say which side of the Widget an entry falls on.

So those two pages carry **two arrays instead of one**: `componentsBeforeWidget` and `componentsAfterWidget`. Both hold the same Page Component dictionary as `pageComponents`, both may be empty, and the Widget sits between them at a position no editor can move. `pageComponents` stays the field for every page that has no Widget, hidden in the Studio when `pageType` is `gift` or `book`, and the two new fields are hidden when it is `home`.

This makes `pageType` **shape-bearing**, which [ADR 0010](./0010-page-content-lives-in-documents.md) said it was not. That ADR's test is still the right test — a discriminator earns a separate document type when it changes the document's shape — and its answer was correct when the three fixed pages were "a Venue reference, a Page Cover and a Page Component array, byte for byte". The Widget is what stopped that from being true. The reading to take from 0010 is its test, not its verdict.

The document type is nevertheless **still one**. Splitting `venuePage` into a home type and a widget-page type would duplicate the `venue` reference, the `pageCover` field, the readOnly `pageType`, the deterministic-id scheme and the Studio structure's fixed children — a page's worth of schema to express a difference of two array fields. The three pages are still created the same way, still live under the same venue in the Studio, and still share every field but these.

What does split is the **Query Module**. `venuePage.ts` now fetches the home page only and takes no `pageType`; `venueWidgetPage.ts` takes `pageType: "gift" | "book"` and projects the two arrays. ADR 0010 merged them on the grounds that "home, gift and book share one projection and one schema exactly", and that is precisely what this change ends — so the merge argument expires with it, and [ADR 0009](./0009-sanity-query-modules.md)'s standing rule applies instead: modules duplicate freely, because a shared projection is a coupling. `pageComponentsProjection` grows a `field` parameter, the same shape `optionalCtaProjection` already has.

`hasAuthorableCta` survives, in `apps/sanity` only. The Studio still needs it — one document type means the Page Cover's call-to-action fields still have to be hidden for the two pages whose buttons point at a Widget anchor the build owns. Its mirror in `@repo/api` is deleted: the two query modules now _are_ the distinction it was faking, so `venuePage.ts` passes `hasCta: true` and `venueWidgetPage.ts` passes `hasCta: false`, both as literals.

## Alternative: put the Widget in the Page Component dictionary

One array, with a `bookingWidget` component the editor drops in like any other. It needs no new fields and no conditional anything.

Rejected because the Widget is not content. Nothing in a dictionary entry can say "exactly one of these, on exactly these two page types" — an editor could author two, or none, and the second case is a booking page with no way to book. The rule would live in a validation callback, the Studio would need a filtered dictionary per page type, and the `_type` would have to carry which of the two widgets it is. Two fields whose names say where they are beat one field plus three rules about what may go in it.

## Alternative: keep `pageComponents` as the before-slot and add only an after-slot

The smallest possible diff: `pageComponents` already renders above the Widget today, so it _is_ the before-slot, and only `componentsAfterWidget` is new. No rename, no hidden field on `home`, no touching the existing data.

Rejected on the Studio surface it produces. An editor on the booking page would see "Page Components" and "After the widget" and have to infer that the first means "before" — the two fields are a pair and only one of them says so. The names are the whole interface here, and a field whose position is implied by the absence of a suffix is the kind of thing that is obvious to whoever wrote it and to nobody else.

## Consequences

- **Both slots exist on both widget pages, with no validation**, even though today's gifting design has nothing below its Widget. The schema records what the pages _can_ hold, not what one venue's current design happens to fill; encoding "gift has no after-slot" would put a `pageType` branch back inside `venueWidgetPage.ts`, which is the thing splitting the module removed.
- **Empty is normal.** Both arrays are `.nullable()` in Zod — the projection asks for them, GROQ resolves an unwritten field to null — and become `[]` in the adapter. A venue with an unwritten gift page still builds; it renders a cover, a Widget and a footer.
- **`VenuePageType` is gone from `@repo/services`.** `VenuePage.astro` no longer takes a `pageType` prop at all, and the two widget pages take `VenueWidgetPageType`. The enum still exists in the Studio schema, where it names the route and fills the document id.
- **The Page Cover's calls to action are still hardcoded in `apps/web`** — French labels, `#booking` and `#prices` — and the gifting page still points its primary button at `#booking` while its Widget anchors at `#gifting`. Untouched here on purpose; it belongs with the Page Cover work, not with the component slots.
- **The old `pageComponents` value on the four gift and booking documents is unset** as part of seeding, not migrated. The dataset is local, seven documents, and an orphan array the Studio no longer shows is worse than no array at all.
