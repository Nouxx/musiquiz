# The blog rating pill reads Google Places

A blog article about a venue shows that venue's Google rating under its summary: stars, "4,7/5 sur 1 856 avis", and the Google Maps logo. It replaces `reviewCount`, a number typed per article under a hardcoded "5/5", which went stale on every new review.

The hand-typed key facts beside it (`chips`: "75 min de jeu", "Dès 21€ par personne"…) were dropped at the same time, at the client's request. The rating pill is the only one left.

- `venue.googlePlaceId` is required. A venue inside a partner centre (Koezio, FUNLAB, Noraebang…) with no Google listing of its own points at the centre's, so its rating is the centre's.
- The static build calls Place Details (New) once per venue, memoized in `getVenueReviews`. The SSR worker calls it per request, memoized per isolate.
- A Google failure fails the build. Cloudflare keeps the last deploy live, so it blocks deploys, not visitors.
- Stars are `Math.round(rating)` yellow out of five, the rest muted. Below four the pill is hidden: a weak rating does more harm than none.
- The Places API terms require the official Google Maps logo, unmodified, 16–19px tall, labelled "Google Maps", within the pill. It lives in `packages/ui/src/logos/`, not with the recolourable icons (ADR 0007).

## Cost

`fetchPlaceInfo` sends `X-Goog-FieldMask: id,rating,userRatingCount`. Google bills a request at the highest SKU any of its fields triggers ([SKU details](https://developers.google.com/maps/billing-and-pricing/sku-details), Place Details):

| Field             | SKU it triggers                     |
| ----------------- | ----------------------------------- |
| `id`              | Place Details Essentials (IDs Only) |
| `rating`          | **Place Details Enterprise**        |
| `userRatingCount` | **Place Details Enterprise**        |

So every call is **Places API Place Details Enterprise**, SKU `2D9A-3DE0-3766` ([pricing](https://developers.google.com/maps/billing-and-pricing/pricing)):

| Monthly calls     | USD per 1,000 calls |
| ----------------- | ------------------- |
| 0 – 1,000         | free                |
| 1,001 – 100,000   | 20.00               |
| 100,001 – 500,000 | 16.00               |
| 500,001 – 1M      | 12.00               |
| 1M – 5M           | 6.00                |
| over 5M           | 1.51                |

The free cap is per SKU, and volume counts across every project on the billing account. Read 2026-10-18; Google reprices, so check both pages before relying on the figures.

A build costs one call per venue with an article, at most 19. SSR preview views add one per page and isolate. Both stay far inside the free cap. Any field added to the mask can only keep the SKU or raise it, never lower it.

## Accepted risk: the rating is cached in static HTML

The [Places API policies](https://developers.google.com/maps/documentation/places/web-service/policies) forbid caching or storing Places content; only the place ID is exempt. The static build bakes the rating into HTML until the next deploy, and publishing content does not trigger one yet. The client accepted this exposure. Wiring the Sanity publish → deploy hook shortens how long a rating sits.

## Alternative: fetch the rating at request time

A worker endpoint calls Google and the pill fills in client-side. Compliant on caching. Rejected: a billed call per page view, and a loading state or layout shift on an otherwise static page.

## Alternative: a Trustindex rating widget

The client already pays for Trustindex, and ADR 0026 names its rating widget as the clean way to show a score. No key, no terms question. Rejected: a third-party script with Trustindex's own styling instead of the designed pill.

## Alternative: `aggregateRating` in JSON-LD

Rejected, no upside. `BlogPosting` is not a review-snippet type. On the venue's `EntertainmentBusiness`, Google ignores self-serving reviews, even through an embedded widget. And its [review snippet guidelines](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) say "Don't aggregate reviews or ratings from other websites" — which a Google rating on our page is. Stars already show in the local pack, from each venue's Business Profile.
