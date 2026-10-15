export const bookingAnchor = "booking";
export const giftingAnchor = "gifting";

// data-settings only carries the tenant API base: the widget picks `instance`
// and `domain` out of the decoded JSON and drops everything else. Each venue is
// its own tenant, so the value comes from the venue in Sanity.

// locale comes from a `?locale=` / `?lng=` query param (hash is read too),
// and /api/public/boot advertises languagesAllowed ["fr"], localesAllowed ["en"].

// OPEN QUESTIONS
// - plugged to main, isn't is too risky?
//
// CSP allowlist, read off the widget bundle. Adyen only appears as the SDK
// stylesheet URL; its runtime hosts are inferred, confirm on a real payment.
//
// script-src   https://widgets.4escape.app
//              https://cdn.jsdelivr.net                        (confetti)
// style-src    https://widgets.4escape.app
//              https://checkoutshopper-live.cdn.adyen.com
//              'unsafe-inline'                                 (theme + widget_css injected as <style>)
// font-src     https://widgets.4escape.app                     (font awesome)
// img-src      https://res.cloudinary.com
//              https://cloudinary.4escape.io
//              https://widgets.4escape.app
//              https://booking.thegame-france.com              (icons hardcoded in main.css)
//              data:
// connect-src  each venue's tenant domain, https://*.4escape.io
//              https://ip2c.org                                (phone input country guess)
//              https://checkoutshopper-live.adyen.com
// frame-src    https://checkoutshopper-live.adyen.com
//              3-D Secure hands off to the issuing bank, so the ACS domain
//              cannot be enumerated — a strict frame-src will break payments.
// form-action  same 3-D Secure caveat.
