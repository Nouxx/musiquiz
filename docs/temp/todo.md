# P0 (top priorities)

- setup carto api key for production (restrict to domain) - BLOCKED
- 4escape todo file (CSP) - BLOCKED
- add apple pay file
- newsletter integration

# P1 (important)

- add link to video in carousel to redirect on click
- Allow horaire fermé
- Proper style on 404 page
- Header logo redirects
- Blog: add code block (youtube, instagram...)
- Cloudflare Access policy on musiquiz-ssr. It serves drafts
- Form security: prevent attacks
  - honey pot
  - rate limiting by IP
  - Origin/Referrer check
- TextBlock: Quand on veut un retour à la ligne, ça marche pas dans le rendu. Comme si l’équivalent de <br> ne fonctionnait pas. On peut aller à la ligne mais en ayant un grand espace (l’équivalent de <p> j’imagine).
  - On n’a pas de mise en forme dispo à part le bold. Pas d’italique, ni souligné, ni barré (on s’en sert pas tous les jours mais parfois ça peut servir)
- Make Zod errors human readable in the build (optional)
- Optimize build time (cache images and video)

# P2 (cosmetics)

- burger mobile menu: book must be visible at the thumb area
- enter animation for cards (bottom to top)
- Stronger liquid glass effect on WhereToFindUs (https://musiquiz-ssr.clement-vnnq.workers.dev/lille Safari is doing it better)
- Logo strip: petit fondu en mode horizontal
- All preview in FR in Studio
  - French label in first
- cards image should also be clickable
- Dev bug in sanity studio: menus disappears
- Carousel arrows under, not above
- Footer revamp: make a grid
  - also: the bottom line can have weird display
  - the copyright should be last in this situation
- Center the pills in "Nos modes de jeux" Lille
- Rolling banner: parallax effect and array of string

![](./bug_line_footer.png)

- make the popup smaller
- Titles and subTitle for some components (ex: cardsGrid) should have more horizontal space
  - booking and home in lille
  - try full width

# Questions
