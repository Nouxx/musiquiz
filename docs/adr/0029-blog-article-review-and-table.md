# A blog article carries one real review and tables in its body

The client asked for two additions to the Blog Article page: a customer review, and comparison tables.

## The review is a real Google review, copied word for word

`blogArticle.featuredReview` is optional, one per article, rendered after the Article Body and before the Find Us block:

- `authorName`, `text`, `rating` (1 to 5, whole) and `sourceUrl` are required. `avatar` is optional; without it the reviewer's initial is shown.
- `sourceUrl` is the review on Google. The Google logo links to it. Requiring it is the only way the CMS can hold editors to "real reviews only".
- The text is never clamped. A soft warning past 220 characters steers editors toward short reviews instead.

The Google logo tells a visitor the review came from Google. French consumer law (Code de la consommation, L.111-7-2 and L.121-4, as amended by the Omnibus directive) makes a fake or reworded review presented as a customer's a misleading commercial practice. Google's own terms are a separate matter the client chose to accept.

It is not a Reviews block: that one is a Trustindex widget ([ADR 0026](./0026-reviews-are-trustindex-widgets.md)). This review is typed by an editor from a public Google page, so the Trustindex terms do not apply.

## The review is not in JSON-LD

The review would need an `itemReviewed`, and the only honest one is the venue's `EntertainmentBusiness`, a `LocalBusiness`. Google shows no review snippet for reviews a business publishes about itself, and its [review snippet guidelines](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) forbid reviews taken from other sites. Ignored at best, a structured-data manual action at worst, which can drop the site's FAQ rich results with it. Same reasoning as the rating pill ([ADR 0027](./0027-blog-rating-pill-reads-google-places.md)).

## Tables are Portable Text blocks in the Article Body

The Article Body accepts `table` blocks, edited with the Studio's native table editing (Studio 6.6, `@portabletext/plugin-table`). Any number per article, of any size. Each one has exactly one header row. A cell holds paragraphs with bold and links. The client's "3 columns, 20 rows" is a guideline, not validated.

The page renders a `<table>`: the header row as `<th scope="col">`, the first column as `<th scope="row">`. The author introduces a table with an h2 of the body; there is no caption.

### Alternative: a fixed `comparisonTable` field

An object of headers and rows of strings, rendered after the body. Rejected: the client wants tables placed in the text, and a nested array of string arrays is a poor editor for 20 rows.

### Alternative: a fixed field wrapping a one-table Portable Text array

Native table editing outside the body. Rejected with the fixed field: the table belongs in the text.

### Alternative: the `@sanity/table` plugin

Rejected: an extra dependency the native table editing replaces, with string-only cells.
