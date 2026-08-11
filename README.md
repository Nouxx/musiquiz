# musiquiz

musiquizlejeu.fr

## Deployment

The site ships as **two Cloudflare Workers** built from the same `apps/web` source. They differ in how they render, and that is what their names say:

| Worker            | Astro `output` | Content                           | Bindings                                      |
| ----------------- | -------------- | --------------------------------- | --------------------------------------------- |
| `musiquiz-static` | `static`       | published, baked in at build time | assets only                                   |
| `musiquiz-ssr`    | `server`       | drafts, fetched per request       | assets, `SESSION` KV, `SANITY_API_READ_TOKEN` |

### One flag drives both builds

`SSR_BUILD` is the only switch. It selects `output`, the adapter, the `outDir`, the `image.domains` allowlist (`astro.config.mjs`) and whether Sanity is queried for drafts (`src/libs/getSanityConfigFromEnvironment.ts`). One flag, so the two builds cannot disagree about what they are.

`CLOUDFLARE_ENV` is set alongside it. `@astrojs/cloudflare` reads that variable to resolve `wrangler.jsonc` and bakes the result into `dist/ssr/server/wrangler.json`, which is what actually gets deployed.

### Commands

```sh
pnpm build:web:static && pnpm deploy:web:static # → musiquiz-static
pnpm build:web:ssr && pnpm deploy:web:ssr # → musiquiz-ssr
```

Locally, `pnpm dev` runs both: static on `:4321`, ssr on `:4322`.

The wrangler environment names match the worker names, so there is one vocabulary from the pnpm script through to the deployed worker. The two deploys reach it differently, though, and the asymmetry is deliberate:

- `deploy:static` passes `--env static` against `wrangler.jsonc`, which still has its `env` blocks to select from.
- `deploy:ssr` passes **no** `--env`. It deploys `dist/ssr/server/wrangler.json`, which the adapter already resolved for `CLOUDFLARE_ENV=ssr`. Adding `--env ssr` there makes wrangler append the env name a second time and deploy a worker called `musiquiz-ssr-ssr`.

### What Cloudflare builds on a push

Both workers use **Cloudflare Workers Builds**, connected to this repo's `main` branch. Configure each trigger in the dashboard as:

| Field          | `musiquiz-ssr`        | `musiquiz-static`        |
| -------------- | --------------------- | ------------------------ |
| Branch         | `main`                | `main`                   |
| Root directory | `/`                   | `/`                      |
| Build command  | `pnpm build:web:ssr`  | `pnpm build:web:static`  |
| Deploy command | `pnpm deploy:web:ssr` | `pnpm deploy:web:static` |

Those commands are deliberately bare script names. Every decision they expand to — env flags, adapter, worker name, bindings, output directory — lives in `apps/web/package.json` and `apps/web/wrangler.jsonc`, so changing any of it is a commit, not a dashboard visit. Only renaming a script requires touching Cloudflare.

GitHub Actions deploys nothing; `.github/workflows/ci.yaml` is a pre-merge gate (format, lint, typecheck, build) and holds no secrets. Workers Builds is used instead of an Actions deploy because it exposes a **deploy hook URL** that Sanity can call on publish, with no GitHub token to mint, store or rotate.

### Secrets and env vars

Public config (`SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`) lives in the committed root `.env` and is inlined at build time.

`SANITY_API_READ_TOKEN` is a real secret and is entered by hand in two places: `.env.local` for local dev, and a Cloudflare Secret on `musiquiz-ssr`. It is never needed by `musiquiz-static`, which only reads published content, and never by CI.

Secrets do **not** carry across a worker rename — a renamed worker is a new worker, and its secret must be set again.

### The `SESSION` KV namespace is pinned on purpose

`env.ssr` in `wrangler.jsonc` declares `SESSION` with an explicit namespace id. `@astrojs/cloudflare` would otherwise inject the binding without one, which forces `wrangler deploy` to provision a namespace at deploy time — something the non-interactive Workers Builds runner cannot be relied on to do.

### TO DO:

- **Publishing content does not reach the live site.** The intended path is Sanity publish → Cloudflare deploy hook → `musiquiz-static` rebuild. It is not wired: there are no webhooks on the Sanity project, and there is no deploy hook URL to point one at until `musiquiz-static` has a Builds trigger. `musiquiz-ssr` is unaffected — it fetches at request time.

- **`musiquiz-ssr` serves Sanity drafts to anyone who has the URL.** It needs a Cloudflare Access policy in front of it. See `docs/temp/todo.md`.
