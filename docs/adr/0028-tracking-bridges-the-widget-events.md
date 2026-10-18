# Tracking bridges the Widget's events

The client runs Google Ads through several agencies, one per group of Venues. Each agency owns a GTM container and must see its own Venues only. Musi'Quiz owns a Global Container for the shared tools, GA4 among them.

## Containers

- `siteSettings.globalGtmId` loads on every page.
- `venue.gtmId` loads on that Venue's pages only, fr and en, next to the global one. It is optional and not tied to the Booking Provider: an untracked Venue leaves it empty.
- All containers share one `dataLayer`. Before any of them, `Layout.astro` sets Consent Mode v2 defaults (all `denied`) and pushes the Page Context: `venue` (absent off Venue pages), `page_type` (`book`, `gift`, `content`), `language`.
- Preview and production builds load them. `astro dev` does not, so local traffic stays out of the agencies' reports. Agencies filter the preview by hostname.

Consent itself (the banner, the `consent update`) is a CMP the client picks and the global container loads. The site does not go live without it.

## The booking funnel

The client asked for GA4 ecommerce events on the funnel, assuming 4escape pushes them. It does not. Read off `widgets.4escape.app/main.js`:

- The Widget dispatches `CustomEvent`s on `document`: `analytics:add_to_cart`, `analytics:remove_from_cart`, `analytics:add_payment_info`. Their `detail` is already GA4-shaped (`currency`, `value`, `items`). Nothing reaches `dataLayer`.
- No `begin_checkout`, no `purchase`.
- A paid order lands on `#/checkout-thankyou?orderUid=…&paymentSuccess=1`, on the same page, after Adyen runs inline or after a 3-D Secure redirect.
- `window.forescapeRouter` (vue-router, hash history), `window.forescapeStoreOrder` and `window.forescapeStoreAnalytics.triggerEvent` are globals.

`analyticsBridge.ts`, loaded with the Widget:

- forwards each `analytics:*` event as `{ ecommerce: null }` then `{ event, ecommerce }`;
- calls the Widget's own `triggerEvent("begin_checkout", order)` when the router enters `/checkout`, so the payload has the Widget's shape;
- stashes the order payload in `sessionStorage` on `begin_checkout` and `add_payment_info`, then on the thank-you route pushes `purchase` with `transaction_id = orderUid`, the stashed value and items, and `payment_option` (`total` or `deposit`). Uids already sent sit in `localStorage`, so a reload does not count twice. Without a matching stash, `purchase` goes out with `transaction_id` only.

`value` is the full order, not the deposit: Ads optimise on booking value.

## Leads

On a 2xx from the worker, the quotation, contact and franchise forms push `generate_lead` with `form_name` and `venue`. No personal data. The newsletter is not a lead.

## Alternative: ask 4escape for native pushes

The right fix, and asked for in parallel. Rejected as the only path: it has no date. If it ships, delete the bridge.

## Alternative: the agencies listen in GTM

A Custom HTML tag can listen to the same `CustomEvent`s. Rejected: every agency would rebuild it in its own container, and `purchase` still needs the stash, which only page code can do before the redirect.

## Alternative: hashchange

Rejected: hash history navigates with `pushState`, which fires no `hashchange`. The bridge polls for `forescapeRouter` for 30 seconds, then hooks `afterEach`.

## Consequences

- Every name the bridge reads is a Widget internal. `main.js` is unversioned, so 4escape can break the bridge on any deploy. Every call is guarded, so a break loses events, never a booking.
- A tenant can override the thank-you URL in the 4escape back office (`widgetDefaultPublicCheckoutThankyouUrl`). One that points elsewhere loses `purchase`.
- 4escape sends the GA client id with the order. If a tenant also has server-side GA in 4escape, `purchase` may arrive twice; GA4 drops repeats of one `transaction_id`.
- No strict CSP: GTM loads whatever the agencies configure.
