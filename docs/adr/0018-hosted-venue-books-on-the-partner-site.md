# A Hosted Venue books on its partner's site

Some Venues sit inside another business's premises — Orléans runs in a karaoke bar — and that partner already sells the sessions through its own booking site. Such a Venue is a **Hosted Venue**: `hostedByPartner` on the `venue` document, with a `partnerBookingUrl` and an optional `partnerGiftingUrl`, neither localized.

**The partner owns booking, so the site has no booking page for it.** `/[venue]/reserver/` and `/en/[venue]/book/` are not generated, and every "Réserver" of the Venue opens the partner URL in a new tab: the venue header, the Prices, Offers and Contact Panels sections, the blog article closing on it, and the Global Booking Page map.

**Gifting follows booking.** The gift pages are not generated either. With a `partnerGiftingUrl` the header's "Offrir une partie" opens it; without one the link is hidden, since our Gifting Widget does not sell the partner's vouchers.

**The decision is made once, in `@repo/services`.** Queries project the Venue's links through `shared/venueLinks.ts`, and `toBookingLink` / `toGiftingLink` return `{ url, external }`. `apps/web` never reads the flag; `@repo/ui` turns `external` into `target="_blank"`.

- _A single optional URL whose presence means hosted_ was rejected: the editor's intent would be implicit, and a cleared field would silently bring the booking page back.
- _Redirecting `/[venue]/reserver/` to the partner_ was rejected: the site is not live, so no old URL needs saving, and no link points there.
- _Keeping the booking page with a link out in place of the widget_ was rejected: a page whose only job is to send the visitor elsewhere is one click too many.

## Consequences

- A Venue Page of type `book` or `gift` on a Hosted Venue is never rendered; the Studio warns on it.
- The partner links are dropped in the query once the flag is off, so a leftover value never leaks. A Hosted Venue with no booking URL fails the build.
- The other way round, a Venue that is not hosted carries its booking and gifting widget ids, and the build fails without them.
