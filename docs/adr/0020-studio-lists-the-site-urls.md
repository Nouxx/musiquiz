# The Studio lists the site URLs

Editors type URLs by hand: a CTA's `url` once per language, a blog link's path, a rich-text link's full address. The schema checks the prefix only, so `/toto` and `/en/paris/reserver/` both pass and 404. Editors own their content; the Studio guides them, it does not refuse them.

A **Site URLs** tool lists every page the site has, French and English side by side, grouped into global pages, one section per Venue, and the blog. Each path copies in one click. A Venue whose booking or gifting is on a partner site shows that partner link where the page would be. The three URL fields point to the tool in their description.

**The list comes from the build's own code.** The tool calls the `get*Slugs` functions in `@repo/services` that feed `getStaticPaths`, and turns the slugs into paths with `getRoutesForLang`. Which pages exist is decided in one place, so the tool cannot promise a page the build skips. The tool fetches at runtime and refreshes on publish: a new Venue appears without a deploy. A code change reaches the Studio through its deploy on every push to `main`.

- _A file generated from the routes at build time_ was rejected: it goes stale between builds, and it knows the patterns but not which Venues, games and events exist.
- _GROQ queries written in the Studio_ were rejected: they would copy the existence rules (`4escape` only, authored pairs only) and drift from the build.
- _Suggestions inside the URL input_ were rejected for now: more work, and a step toward enforcing.
- _A warning on any path missing from the list_ was rejected for now: it needs the list inside every validation run, for mistakes the tool may already prevent.

## Consequences

- The tool reads published content only, like the build. A page published since the last deploy is listed before it is live; the tool says so.
- A route added to `getRoutesForLang` must be listed by `siteUrls.ts` or named as unlisted, or its test fails; the Studio label map is typed on the listed routes, so a missing label fails the type check.
- Content the build would reject breaks only its own section of the tool, with the build's error message.
- A rich-text link to `musiquiz.co` without its trailing slash gets a warning ([ADR 0016](./0016-urls-end-with-a-trailing-slash.md)). Elsewhere, paths are left to the tool: a CTA or blog path is not checked against the list.
