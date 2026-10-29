# musiquiz

musiquizlejeu.fr

## Deployment

The project runs on **three Cloudflare Workers**. Two serve the site, built from the same `apps/web` source. They differ in how they render, and that is what their names say:

| Worker            | Astro `output` | Content                           | Bindings                                      |
| ----------------- | -------------- | --------------------------------- | --------------------------------------------- |
| `musiquiz-static` | `static`       | published, baked in at build time | assets only                                   |
| `musiquiz-ssr`    | `server`       | drafts, fetched per request       | assets, `SESSION` KV, `SANITY_API_READ_TOKEN` |

The third, `musiquiz-worker`, is the site's backend: forms and the Studio Deploy tool, see [The `musiquiz-worker` API](#the-musiquiz-worker-api).

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

### The `musiquiz-worker` API

`apps/worker` is a plain Worker, no framework. Every route is a `POST` with a JSON body, listed in `src/routes/index.ts`:

| Route                  | Called by                  | Does                                                                                                      |
| ---------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------- |
| `/form/client-contact` | the site's contact form    | mails the venue owners, and a confirmation to the sender                                                  |
| `/form/quotation`      | the site's quotation form  | same, with the template pair of the audience                                                              |
| `/form/venue-opening`  | the site's franchise form  | scores the lead, mails Musiquiz, and a confirmation to the applicant                                      |
| `/form/newsletter`     | the footer newsletter form | adds a Brevo contact, or mails the owners, see [ADR 0033](docs/adr/0033-newsletter-provider-per-venue.md) |
| `/deploy/site`         | the Studio Deploy tab      | rebuilds `musiquiz-static`, see [Publishing content](#publishing-content-the-studio-deploy-tool)          |

Every mail goes through ZeptoMail, authenticated with `ZOHO_API_KEY`. The form logic lives in `@repo/services/form`; a route only parses the body and passes in the secrets.

Both callers reach the worker through `SANITY_STUDIO_WORKER_URL` in the root `.env`. Point it at the local worker in `.env.local` to test against `wrangler dev`.

CORS allows only the origins in `ALLOWED_ORIGINS` (`src/index.ts`): the two site workers, the Studio, and their local dev ports. A new origin, like the production domain, must be added there, or browsers block the forms.

```sh
pnpm deploy:worker # → musiquiz-worker
pnpm --filter worker typegen # after adding a var or secret, regenerates Env
```

`pnpm dev` runs it with `wrangler dev` alongside the site. Its secrets come from `apps/worker/.dev.vars`, see [Secrets and env vars](#secrets-and-env-vars).

### What Cloudflare builds on a push

Every worker lives on the client's Cloudflare account, pinned by `account_id` in both `wrangler.jsonc`, so a local `wrangler deploy` cannot land on another account. The workers deploy from two systems ([ADR 0035](./docs/adr/0035-deploy-split-actions-and-workers-builds.md)):

| Worker            | Deployed by                                             | On                                       |
| ----------------- | ------------------------------------------------------- | ---------------------------------------- |
| `musiquiz-ssr`    | GitHub Actions, `.github/workflows/deploy-workers.yaml` | push to `main`, or a manual run          |
| `musiquiz-worker` | GitHub Actions, `.github/workflows/deploy-workers.yaml` | push to `main`, or a manual run          |
| `musiquiz-static` | Cloudflare Workers Builds                               | push to `main`, or the Studio Deploy tab |

`deploy-workers.yaml` runs one job per worker, in parallel, with no path filter and no checks: a failed build deploys nothing, and `ci.yaml` already gates pull requests. A manual run takes a `target` (`all`, `ssr` or `worker`). Its secrets are GitHub repository secrets:

| Secret                 | Used by                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN` | both deploys. Account-owned token on the client account: Workers Scripts Edit, Workers KV Storage Edit, Account Settings Read |
| `CARTO_API_KEY`        | the `musiquiz-ssr` build                                                                                                      |

`musiquiz-static` stays on Workers Builds because the Studio Deploy tab needs its **deploy hook**. Configure its trigger in the dashboard as:

| Field          | `musiquiz-static`        |
| -------------- | ------------------------ |
| Branch         | `main`                   |
| Root directory | `/`                      |
| Build command  | `pnpm build:web:static`  |
| Deploy command | `pnpm deploy:web:static` |

Until this repo moves to a GitHub organization, `musiquiz-static` has no trigger: the Cloudflare GitHub app on the repo's current owner is bound to another Cloudflare account. Deploy it by hand meanwhile, logged into the client account:

```sh
SITE_URL=https://musiquiz.co pnpm build:web:static && pnpm deploy:web:static
```

`SITE_URL` is forced because a local `.env.local` points it at `localhost`, which would end up in every canonical URL and the sitemap.

`deploy:static` also pings [IndexNow](https://www.indexnow.org/) with every sitemap URL once `wrangler deploy` succeeds (`apps/web/scripts/submitIndexNow.js`). A failed ping only warns.

Those commands are deliberately bare script names. Every decision they expand to — env flags, adapter, worker name, bindings, output directory — lives in `apps/web/package.json` and `apps/web/wrangler.jsonc`, so changing any of it is a commit, not a dashboard visit. Only renaming a script requires touching Cloudflare.

### Publishing content: the Studio "Deploy" tool

`musiquiz-static` bakes content in at build time, so a publish in Sanity reaches it only after a rebuild. Editors trigger that rebuild by hand from the **Deploy** tab in the Studio, once their batch of edits is published. There is no publish webhook on purpose: one build per publish would burn the Workers Builds quota, which is shared by every worker on the account. `musiquiz-ssr` needs no rebuild, it fetches at request time.

The button calls `POST /deploy/site` on `musiquiz-worker`, which:

1. checks the editor's Sanity token against `/users/me` and requires the `administrator`, `editor` or `developer` role,
2. calls the `musiquiz-static` deploy hook, held as the `STATIC_DEPLOY_HOOK_URL` secret.

Build minutes used this month show on the [Workers & Pages overview](https://dash.cloudflare.com/a98829785d9ad4b7960ca91370b92848/workers-and-pages); the Deploy tab links there. Cloudflare has no API for them.

The hook URL never reaches the Studio: anything in a `SANITY_STUDIO_*` var ships in its public bundle. The Studio uses `loginMethod: "token"`, because a cookie session leaves the client with no token to forward.

#### Creating the deploy hook

The hook belongs to `musiquiz-static`, which must already have its Builds trigger connected to the repo (see the table above).

1. In the Cloudflare dashboard, open **Workers & Pages** → `musiquiz-static` → **Settings** → **Builds** → **Deploy Hooks**.
2. Name it `sanity-studio-deploy` and pick the `main` branch. A hook always builds the branch it was created with.
3. Select **Create** and copy the URL. Store it straight away as the worker secret:

   ```sh
   cd apps/worker && npx wrangler secret put STATIC_DEPLOY_HOOK_URL
   ```

   For local dev, paste it into `apps/worker/.dev.vars` as well.

The URL is the only credential: anyone holding it can start builds, with no other check. Keep it out of `.env`, the Studio and chat. Cloudflare offers no rotation. If it leaks, delete the hook, create a new one and run `wrangler secret put` again; the old URL stops working on deletion.

There is no cooldown, because Cloudflare already bounds repeated clicks:

- A trigger landing while a build is queued or initializing is merged into it, and the hook answers `already_exists: true`. This part is documented.
- A trigger landing while a build is running queues one new build. It does not cancel the running one. Every later trigger merges into that queued build. Tested on 2026-10-18; Cloudflare does not document it.

So a burst of clicks costs at most one extra build. That build is wanted: content is fetched when a build starts, so it picks up whatever was published after the running build fetched. A cooldown would drop exactly those changes. Cancelling the running build instead is possible through the Builds API, but needs a user-scoped Cloudflare token able to edit build settings, which is a far stronger secret than the hook URL.

### Videos are encoded in the static build

`build:static` runs `apps/web/scripts/encodeVideos.js` before `astro build`. It encodes every published cover and carousel video into an AV1 and an H.264 MP4, which the build bundles into `dist/static/_astro/` ([ADR 0022](./docs/adr/0022-cover-video-is-a-plain-file-asset.md), [ADR 0023](./docs/adr/0023-carousel-video.md)). `dev` and `musiquiz-ssr` play the raw upload instead.

- **ffmpeg comes from `node-av`.** Its postinstall downloads a pinned ffmpeg build with SVT-AV1 and x264 for the host platform. pnpm only runs it because `node-av` is in `onlyBuiltDependencies` (`pnpm-workspace.yaml`). Nothing to install on the machine. The Linux binary needs Ubuntu 24.04 or later.
- **Encodes are cached** in `apps/web/node_modules/.astro/video/`, keyed by the Sanity asset id and the profile (`cover` or `carousel`), so only a new upload costs build time. Workers Builds keeps Astro's cache directory between builds.
- **An encode over its cap fails the build** (10 MB for a cover, 5 MB for a carousel slide) and names the document. Trim the clip and publish again.

## The Studio deploys from GitHub Actions

`.github/workflows/deploy-sanity.yaml` deploys the new Sanity Studio version on every push to `main`. The workers and the Studio therefore deploy from independent workflows triggered by the same push: they run in parallel, neither knows about the other, and one failing leaves the other deployed. There is nothing to roll back because there is nothing joining them.

### Deploying the Studio by hand

```sh
pnpm deploy:sanity
```

Locally this authenticates with your Sanity CLI session (`~/.config/sanity/config.json`), so no token is needed. `SANITY_AUTH_TOKEN` only exists to stand in for that session where there is no logged-in user.

### Secrets and env vars

Public config (`SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`) lives in the committed root `.env` and is inlined at build time.

`SANITY_API_READ_TOKEN` is a real secret and is entered by hand in two places: `.env.local` for local dev, and a Cloudflare Secret on `musiquiz-ssr`. It is never needed by `musiquiz-static`, which only reads published content, and never by CI.

`ZOHO_API_KEY` is the contact-form worker's secret. Same two-store rule, different local store: `apps/worker/.dev.vars` for local dev, and a Cloudflare Secret on `musiquiz-worker`. `.dev.vars` is the only local file `wrangler dev` loads into the `env` binding — a key in the root `.env.local` reaches the wrangler process but never the worker, and `env` comes back empty. Copy `.dev.vars.example`, fill it in, then:

```sh
cd apps/worker && npx wrangler secret put ZOHO_API_KEY
```

`STATIC_DEPLOY_HOOK_URL` follows the same rule, see [Creating the deploy hook](#creating-the-deploy-hook).

`BREVO_API_KEY_<SLUG>` holds one venue's Brevo key, one secret per venue, see [ADR 0033](docs/adr/0033-newsletter-provider-per-venue.md). It is read by name at request time, so it is not in `Env` and needs no typegen. To put a venue's newsletter on Brevo:

1. In the venue's Brevo account, generate an API key, and note the ID of the list sign-ups should join (_Contacts → Lists_).
2. In the Studio, the venue's _Newsletter_ tab: pick Brevo, fill the list ID, publish. The field's description gives the exact secret name for this venue.
3. On `musiquiz-worker` in the Cloudflare dashboard, _Settings → Variables and Secrets → Add_, type **Secret**, under that name. Locally, the same line in `apps/worker/.dev.vars`.

Until the secret exists, sign-ups are mailed to the venue's owner emails.

Adding a key means rerunning `pnpm --filter worker typegen`, which writes it into `Env` in `worker-configuration.d.ts`.

`SANITY_AUTH_TOKEN` is a GitHub repository secret read by `deploy-sanity.yaml`. It is an **organization-level** robot token created in Sanity Manage under the organization's _Settings → API → Tokens_ (org tokens cannot be created from the CLI), and it needs **two** roles:

| Role                   | Manage label    | Grants                                               |
| ---------------------- | --------------- | ---------------------------------------------------- |
| `sdk-app-editor-robot` | Manage SDK Apps | `sanity-sdk-applications` read / deploy / delete     |
| `deploy-studio-robot`  | Deploy Studio   | `sanity-project` read, `sanity-project` deployStudio |

The name is not a choice: the Sanity CLI reads `SANITY_AUTH_TOKEN` from the environment on its own, so nothing wires it through.

Secrets do **not** carry across a worker rename — a renamed worker is a new worker, and its secret must be set again.

`CARTO_API_KEY` removes the "API key required" watermark from the CARTO basemap tiles drawn by `TileMap`. It is public, not a secret: the client reads it from `astro:env/client`, so it is inlined into the HTML of every page with a map. CARTO restricts it by `Referer` instead. It is required at build time (`optional: false` in `astro.config.mjs`) and is not needed at runtime, so it lives in:

- `.env.local` for local dev
- a Cloudflare **build variable**, not a Secret, on `musiquiz-static`, and a GitHub repository secret for the `musiquiz-ssr` build; without it the build fails

To create or rotate the key, fill in the form at: https://carto.com/basemaps/apikey.

| Field                                   | Value                                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Organisation                            | Musiquiz                                                                                               |
| Commercial                              | Yes                                                                                                    |
| What are you building?                  | A website promoting our entertainment business                                                         |
| Restrict to specific websites (Referer) | Yes, `musiquiz.co`, `musiquiz-ssr.lionel-a98.workers.dev` and `musiquiz-static.lionel-a98.workers.dev` |

Accept the terms and submit. The key arrives by email.

`GOOGLE_PLACES_API_KEY` reads each venue's Google rating and review count, shown under the summary of a blog article about that venue. It is a secret: the server reads it from `astro:env/server`, and every call is billed. `musiquiz-static` calls Google at build time and `musiquiz-ssr` per request, so it lives in:

- `.env.local` for local dev
- a Cloudflare **build variable** on `musiquiz-static`
- a Cloudflare **Secret** on `musiquiz-ssr`
- the `GOOGLE_PLACES_API_KEY_CI` GitHub repository secret, read by `ci.yaml` for the build check

Each place gets its own key, so one can be revoked without touching the others. To create one, in the Google Cloud console of the Musiquiz project (billing must be enabled):

1. _APIs & Services → Library_: enable **Places API (New)**. The legacy "Places API" is a different product and its keys are refused.
2. _APIs & Services → Credentials → Create credentials → API key_.
3. Edit the key:
   - Name: `musiquiz-places-<local|ci|static|ssr>`
   - Application restrictions: **None**. Builds and workers call from no fixed IP or referrer.
   - API restrictions: **Restrict key**, Places API (New) only.
4. Save, and copy the key into its store.

Each venue's Place ID is the `googlePlaceId` field in the Studio. Look it up with the [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id).

### The `SESSION` KV namespace is pinned on purpose

`env.ssr` in `wrangler.jsonc` declares `SESSION` with an explicit namespace id. `@astrojs/cloudflare` would otherwise inject the binding without one, which forces `wrangler deploy` to provision a namespace at deploy time — something a non-interactive CI runner cannot be relied on to do.

### TO DO:

- **`musiquiz-ssr` serves Sanity drafts to anyone who has the URL.** It needs a Cloudflare Access policy in front of it. See `docs/temp/todo.md`.
