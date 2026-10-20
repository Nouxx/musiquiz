# P0 (top priorities)

- setup carto api key for production (restrict to domain)
- Site URLs tool fixes:
  - visual glitch when links are too long
  - add available anchors
- Dans les articles de blog, il faudrait qu’on puisse ajouter un avis (qu’on rédige à la main) et un composant tableau comparatif. C’est hyper important pour le référencement SEO/GEO des articles
- 4escape todo

# P1 (important)

- Cloudflare Access policy on musiquiz-ssr. It serves drafts
- Sanity UI should require localized strings
- Proper style on 404 page
- Blog: add code block (youtube, instagram...)
- Form security: prevent attacks
  - honey pot
  - rate limiting by IP
  - Origin/Referrer check
- UI bug: cards scroller z-index conflicts with header
- Header on mobile: booking button should always be there
- Tight page cover + badge = collapse
- preview icon in Sanity
- Duplicate `#prices` anchor
  - Cause: `venuePrices` is in the shared `pageComponents` array, so any page
    can hold several. `apps/web/src/components/features/PageComponents.astro`
    renders each one with the hardcoded `id={anchors.prices}`.
  - Symptom: two `venuePrices` on a page (or one before and one after a widget
    or the map) render two `id="prices"`. The HTML is invalid, `#prices` jumps
    to the first one, and the Site URLs tool lists one `#prices` row that cannot
    reach the second.
  - Today: no published page has two (checked 2026-10-20); Paris home, Lille
    home and Lille booking have one each.
  - Fix, pick one:
    - schema validation: at most one `venuePrices` per page, across all its
      component arrays. Keeps `#prices` stable for editors' links.
    - a unique id per instance (`prices-<_key>`). Every one is reachable, but
      ids are unreadable and the tool would have to list each.

![](./bug_header.png)

- Weird line breaks with "?" and "!"
- Pour la version mobile, est-ce qu’il est possible pour les onglets Défis / Jokers / Thèmes de les centrer quand c’est retour à la ligne et sur les tarifs activités, on peut pas trouver un Moyer de les mettre sur une ligne quand il n’y en a que 2 ?
- TextBlock: Quand on veut un retour à la ligne, ça marche pas dans le rendu. Comme si l’équivalent de <br> ne fonctionnait pas. On peut aller à la ligne mais en ayant un grand espace (l’équivalent de <p> j’imagine).
  - On n’a pas de mise en forme dispo à part le bold. Pas d’italique, ni souligné, ni barré (on s’en sert pas tous les jours mais parfois ça peut servir)

# P2 (cosmetics)

- burger mobile menu: book must be visible at the thumb area
- enter animation for cards (bottom to top)
- Stronger liquid glass effect on WhereToFindUs (https://musiquiz-ssr.clement-vnnq.workers.dev/lille Safari is doing it better)
- Logo strip: petit fondu en mode horizontal
- Translate UI to FR: https://www.sanity.io/docs/studio/localizing-studio-ui
- Dev bug in sanity studio: menus disappears
- Make Zod errors human readable in the build
- Mobile header not looking good, to investigate
- Carousel arrows under, not above
- Footer mobile, weird line breaks
- Top margin on mobile for booking page
- Footer revamp: make a grid
  - also: the bottom line can have weird display
  - the copyright should be last in this situation
- make the popup smaller

![](./bug_line_footer.png)

- Titles and subTitle for some components (ex: cardsGrid) should have more horizontal space

# Questions

- is gifting widget/page required for all "hosted" venue?
- what is the format of 4escape widget ids?
