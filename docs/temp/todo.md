1. Cloudflare Access policy on musiquiz-ssr. It serves drafts.
1. SANITY_API_READ_TOKEN as CF secret on musiquiz-ssr (does not carry over from musiquiz-preview).
1. apps/web/tsconfig.json includes ./worker-configuration.d.ts, which doesn't exist — run pnpm --filter web generate-types, or drop the include.
1. Validate [venue] before it reaches GROQ, on preview only. Preview builds with output: "server", so getStaticPaths is skipped and Astro.params.venue is a raw URL segment interpolated into slug.current == "...". A segment with a quote in it becomes GROQ, and the preview client reads drafts with a token. Reject unknown slugs (404) at the route or in @repo/services. Blocks the same first deploy as item 1. See ADR 0009.

## Improvements: enter animation for cards

Homepage >

## Concept (TDB)

If one eventFormat, "Nos expériences" becomes "Concept"

- CGV per center
- All socials per center, fallback to global
- one page for joining the network: "ouvrez votre salle"
- One link to Canada, Brussels in
- Reviews widget: fetch from Google, by center, from 4 to 5 stars, with word analysis (ex: EVJF)
- cards grid: in 2 + 1 layout, center the last track
- hotspots for the map: draggable by the user
- center star.svg

### Custom venue page

add custom venue page (slug authored from Sanity) - not accessible from the header

## WhereToFindUs

Strongest liquid glass effect

### Global footer

- Nos jeux: only show signature

### Page de résa global

- Meme composant que la carte mais pour réserver

### Header global

- Accueil: global
- Nos expériences: signature only
- Pareil pour occasions (sans le signature)

### Blog

- Ajouter header
- Pas de page cover
- Génération automatique des pills et seulement avis et c'est la moyenne
- Add code block (youtube, instagram...)

## Logo strip

petit fondu en mode horizontal

## Dedicated funnel for some venues

Reserver button redirects to the partner site (ex: Orléans)

- game price: support exact count: ex: 2 joueurs
- burger mobile menu: book must be visible at the thumb area
- scrollable

## Use case SSR

A blog article in draft is breaking the schema in SSR

## CSS liquid glass

- https://musiquiz-ssr.clement-vnnq.workers.dev/lille Safari is doing it better

## T&C optional

## Quotation form destination from the CMS

Venue > Contact > new field, quotation email(s).

## Translate UI to FR

https://www.sanity.io/docs/studio/localizing-studio-ui

## New page on draft mode

- new page in draft mode (ex: new game) cant be previewed, need to also enable the error in preview mode
