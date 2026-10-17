# Price Tiers are authored, not derived

A Price Tier used to be a player-count band. The editor filled `playerCountFrom` and `playerCountTo`, the Studio checked that the bands of a game fit together, and the front wrote the badge from the counts ("De 4 à 6 joueurs", "Tarif unique") and picked its icon. "Par personne" came from the locale files and was the same on every card.

That is business logic split across the Studio, the locales and the front, and it decides for the editor what a tier may say. The card should not know about players, and the editor should be free to write what the venue sells.

A Price Tier is now authored text around a number:

- `label`: free localized text in the badge.
- `icon`: picked from the shared content icons.
- `amount`: still a number. The front formats it per language, and the currency still follows the Venue ([ADR 0024](./0024-currency-follows-the-venue-country.md)).
- `caption`: required localized text beside the amount. New rows start with "Par personne" / "Per person".
- `note`: unchanged.

The Studio checks only what the layout needs: one to five tiers, and a maximum length on each text so it fits the narrow card. Nothing checks that tiers agree with each other. Two tiers can overlap or contradict each other, and that is the editor's call.

`PriceCard` takes `label`, `labelIcon`, `price`, `currency`, `caption` and `note`, and knows nothing about players.

## Alternative: keep the counts, drop the cross-row rules

Rejected: the front would still own the wording, so a school group or a team price would still need code. Loosening the validation alone leaves the badge unable to say anything new.

## Alternative: price as free text

Lets an editor write "Gratuit" or "Sur devis". Rejected: every editor would format `16€` their own way, and the currency would no longer follow the Venue. `0` is allowed instead.

## Consequences

- Labels are written twice, in French and in English. The migration `authorPriceRows` wrote both from the old counts.
- The Studio row preview shows the French label, then amount · caption · note.
