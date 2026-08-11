Left for you — account-level, not mine to run:

1. Cloudflare Access policy on musiquiz-preview before first deploy. It serves drafts.
2. SANITY_API_READ_TOKEN as CF secret on the preview worker.
3. Old worker web still live. wrangler delete --name web when ready.
4. apps/web/tsconfig.json includes ./worker-configuration.d.ts, which doesn't exist — run pnpm --filter web generate-types, or drop the include.
5. Validate [venue] before it reaches GROQ, on preview only. Preview builds with output: "server", so getStaticPaths is skipped and Astro.params.venue is a raw URL segment interpolated into slug.current == "...". A segment with a quote in it becomes GROQ, and the preview client reads drafts with a token. Reject unknown slugs (404) at the route or in @repo/services. Blocks the same first deploy as item 1. See ADR 0009.
