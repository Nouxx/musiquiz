# The blog has no per-Venue listing; the Venue crumb links to the Venue home

An article's breadcrumbs read "Blog / {Venue} / Title", and the Venue crumb needed somewhere to go. The obvious target is a listing of that Venue's articles at `/blog/[venue]`. It is not built: the crumb links to the Venue home, `/{venue}/`.

**A per-Venue listing competes with the Venue home.** The blog exists for search engines ([ADR 0013](./0013-blog-is-french-only-and-static.md)). `/blog/lille` would target the same "Lille" queries as `/lille/`, the page that converts, and could rank in its place. Linking the crumb to the Venue home sends the blog's link equity to the page that matters, and gives the `BreadcrumbList` a real url.

**With a handful of articles per Venue, the listing is thin.** It would be a filtered copy of `/blog` with no text of its own, a page search engines weigh little and that dilutes the rest.

- _A `/blog/[venue]` listing reusing BlogListing_ was rejected for the two reasons above. It is cheap to build, which is not a reason to publish it.
- _A plain-text crumb_ was rejected: it leaves the `BreadcrumbList` without a url and wastes an internal link.

## Consequences

- `/blog/[slug].astro` builds the Venue crumb from `routes.venueHome`.
- The "Nos derniers articles à {venue}" button drawn under "À lire aussi" is not built. If it is, it links to the Venue home too.
- Revisit when a Venue has around eight articles and there is a French intro to write for it (a `venueBlog.intro`, [ADR 0014](./0014-blog-article-page-closes-on-its-venue.md)). The listing would then need:
  - a guard that fails the build when an article slug equals a Venue slug, since `/blog/[venue]` and `/blog/[slug]` share a pattern;
  - a title and H1 about the blog ("Blog quiz musical à Lille"), not the Venue, and a link to the Venue home near the top;
  - `noindex` until the volume is there.
