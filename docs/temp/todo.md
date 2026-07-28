Left for you — account-level, not mine to run:

1. Cloudflare Access policy on musiquiz-preview before first deploy. It serves drafts.
2. SANITY_API_READ_TOKEN as CF secret on the preview worker.
3. Old worker web still live. wrangler delete --name web when ready.
4. apps/web/tsconfig.json includes ./worker-configuration.d.ts, which doesn't exist — run pnpm --filter web generate-types, or drop the include.
