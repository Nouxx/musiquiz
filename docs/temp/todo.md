# P0 (top priorities)

- add custom venue page (slug authored from Sanity) - not accessible from the header
- Reviews widget: fetch from Google, by center, from 4 to 5 stars, with word analysis (ex: EVJF)
  - also generate article pills from that (count of reviews + average)
- Sanity deploy widget: generate a new site with all published content

# P1 (important)

- Cloudflare Access policy on musiquiz-ssr. It serves drafts
- Sanity UI should require localized strings
- Proper style on 404 page
- Blog: add code block (youtube, instagram...)
- Revoir game prices logic. support exact count: ex: 2 joueurs
- Form security: prevent attacks
  - honey pot
  - rate limiting by IP
  - Origin/Referrer check

# P2 (cosmetics)

- burger mobile menu: book must be visible at the thumb area
- enter animation for cards (bottom to top)
- Stronger liquid glass effect on WhereToFindUs (https://musiquiz-ssr.clement-vnnq.workers.dev/lille Safari is doing it better)
- Logo strip: petit fondu en mode horizontal
- Translate UI to FR: https://www.sanity.io/docs/studio/localizing-studio-ui
- Dev bug in sanity studio: menus disappears
- Make Zod errors human readable in the build

# Questions

- is gifting widget/page required for all "hosted" venue?
- what is the format of 4escape widget ids?
