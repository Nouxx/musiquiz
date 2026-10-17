# Reviews are Trustindex widgets

The Reviews block used to pick its own reviews: a Venue, a minimum star rating and a word filter, with the cards rendered by `Reviews.astro`. The reviews themselves were dummy data waiting on a Google connection.

The client collects and themes their reviews in Trustindex. Trustindex has no public API and no export; the only supported output is its embedded widget, configured in the Trustindex dashboard.

A Reviews block now embeds one Trustindex widget:

- `widgetId`: required. The text after `?` in the embed code. Each block gets its own widget, so the filtering (Venue, stars, keywords) is done in Trustindex, not in Sanity.
- `badge` and `title`: required localized text. New blocks start with "Témoignages" / "Testimonials" and "Ils ont testé... et approuvé !" / "They tried it... and loved it!".
- `surface`: unchanged.

The widget's look, layout and language are the client's, set in the dashboard. `Reviews.astro` only places it: the heading on the left, the widget filling the rest of the row.

The widget's language is set per widget, and the client has French ones. `/en` shows French widget labels ("Publié sur Google", "Réponse du propriétaire"). An English widget per block would fix it, at twice the dashboard work.

A page with a Reviews block preconnects to `cdn.trustindex.io` from its `<head>`, through `PageComponentsHead`. The widget loads as a chain of requests to that CDN.

## Alternative: render our own cards from Trustindex data

The widget fetches `cdn.trustindex.io/widgets/…/content.html`, and its rich snippet fetches `cdn.trustindex.io/companies/…/richsnippet.json`, which holds the aggregate rating and twenty reviews. Both are public.

Rejected: neither is an API, they are undocumented internals of the widget. The [Terms of Use](https://www.trustindex.io/terms-of-use/) forbid automated retrieval and reverse engineering (5.B), make "cumulative user review ratings" Trustindex Content (4.C), and allow the rating score only "in the official formats provided by Trustindex" (6.C).

## Alternative: a rating sentence beside the widget

The design shows "Évaluation Trustindex : 5.0 sur 5, basée sur 2 100 avis" under the title. The widget does not render it.

Rejected for now. Typed by hand, it goes stale on every new review and still shows the Trustindex score outside an official format (6.C). Fetched from `richsnippet.json`, it hits the objection above. A Trustindex rating widget beside the slider would be the clean way, if the client wants it back.

## Consequences

- The migration `trustindexReviews` gave every existing block the client's first widget id, the default badge and title, and cleared `venue`, `starsThreshold` and `searchTerm`. The filters those fields held are now the client's to rebuild as widgets.
- A block without a `widgetId` fails the build, like any other missing content.
- The Studio block preview shows the French title.
