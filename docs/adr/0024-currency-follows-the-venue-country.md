# Currency follows the Venue's country

Lausanne opens in Switzerland and charges in francs. Until now, every price on the site was a bare number with `€` glued on at render time.

A Venue's currency comes from its `addressCountry`: `CH` is CHF, anything else is EUR. `currencyOf` in `@repo/utils` holds that mapping. Both the services and the Studio use it.

Every price carries its currency, not just the page. `@repo/services` emits `{ amount, currency }` on each Price Tier and offer card, and gets the currency from the Venue the block references. Venue Prices, Game Prices and Offers all name their own Venue, and that Venue does not have to be the page's, so a page-level currency would label Lausanne's prices in euros on a network page.

`formatPrice({ amount, lang, currency })` replaces `formatEuros`. Euros render as before: `16€`, `21,50€`. Francs go after the amount, separated by a no-break space: `16 CHF`, `21,50 CHF`. The number follows the site language, not Swiss usage, so a French page writes `21,50 CHF` rather than `CHF 21.50`. The JSON-LD `priceRange` and the Studio previews use the same function.

Out of scope:

- The 4escape widget's currency, which is set in the 4escape back office.
- The budget brackets of the venue-opening form, which are about France and not tied to any Venue.

## Alternative: a `currency` field on the Venue

Rejected: it duplicates the country, and the two can disagree. A future country with its own currency costs one line in `currencyOf`.

## Alternative: currency at the page level

Services would put one `currency` on the page data, and the web would pass it along with `lang`. Rejected: a block can reference another Venue, and its prices would show the page's currency.

## Alternative: Swiss formatting for francs

`CHF 16.–` or `fr-CH` separators. Rejected for now: the site formats by language, not by region. **Revisit** if Lausanne asks for it.

## Consequences

- A copy that hardcodes `€` in Sanity text (a FAQ answer, an offer unit label) is not converted. Editors write the currency out in their copy.
- A Price Tier row in the Studio fetches its Venue's country to show the symbol, because a nested preview cannot select document fields.
