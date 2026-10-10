# Booking and gifting each pick a provider

[ADR 0018](./0018-hosted-venue-books-on-the-partner-site.md) modelled a partner-run Venue as a **Hosted Venue**: one `hostedByPartner` flag, from which booking and gifting both followed. That coupling did not hold. Whether a Venue sells vouchers, and through whom, is a separate question from who takes its bookings, and the flag forced one answer onto both. This ADR supersedes 0018.

A `venue` now carries two choices, made one at a time:

- `bookingProvider`: `4escape` or `external`. Required.
- `giftingProvider`: `4escape`, `external` or `none`. Required.

Each provider brings its own field. `4escape` requires the side's widget id (`bookingWidgetId`, `giftingWidgetId`). `external` requires an https link (`externalBookingUrl`, `externalGiftingUrl`), not localized. `none` requires nothing. New Venues start on `4escape` for both.

**A side gets its widget page only on `4escape`.** `/[venue]/reserver/` is generated when `bookingProvider` is `4escape`, and `/[venue]/offrir/` when `giftingProvider` is. Otherwise every "Réserver" or "Offrir une partie" opens the external link in a new tab, and with `none` the gifting link is hidden. Every combination is allowed; a Venue booking on a partner's site may still sell our vouchers.

**The decision is still made once, in `@repo/services`.** Queries project `{ slug, booking, gifting }` through `shared/venueLinks.ts`, each side a union on `provider`, and `toBookingLink` / `toGiftingLink` switch on it. `apps/web` never reads a provider.

- _A single optional URL whose presence means external_ was rejected, as in 0018: the editor's intent would be implicit, and a cleared field would silently bring the widget page back.
- _Keeping a Hosted Venue flag and adding gifting options under it_ was rejected: it keeps a term that names a business arrangement, when what the site needs is who sells each thing.

## Consequences

- A Venue Page of type `book` or `gift` whose side is not on `4escape` is never rendered; the Studio warns on it.
- An external link is dropped in the query unless its side is on `external`, so switching providers keeps the old value in the Studio without leaking it.
- A missing provider, a `4escape` side without its widget id, or an `external` side without its link fails the build.
