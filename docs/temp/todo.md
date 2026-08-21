1. Cloudflare Access policy on musiquiz-ssr. It serves drafts.
1. SANITY_API_READ_TOKEN as CF secret on musiquiz-ssr (does not carry over from musiquiz-preview).
1. apps/web/tsconfig.json includes ./worker-configuration.d.ts, which doesn't exist — run pnpm --filter web generate-types, or drop the include.
1. Validate [venue] before it reaches GROQ, on preview only. Preview builds with output: "server", so getStaticPaths is skipped and Astro.params.venue is a raw URL segment interpolated into slug.current == "...". A segment with a quote in it becomes GROQ, and the preview client reads drafts with a token. Reject unknown slugs (404) at the route or in @repo/services. Blocks the same first deploy as item 1. See ADR 0009.

- CGV per center
- All socials per center, fallback to global
- one page for joining the network: "ouvrez votre salle"
- One link to Canada, Brussels in
- Reviews widget: fetch from Google, by center, from 4 to 5 stars, with word analysis (ex: EVJF)
- cards grid: in 2 + 1 layout, center the last track
- hotspots for the map: draggable by the user
- center star.svg
