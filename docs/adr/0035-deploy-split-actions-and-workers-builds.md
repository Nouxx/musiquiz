# Deploy split: GitHub Actions and Workers Builds

The workers moved from a personal Cloudflare account to the client's. `musiquiz-ssr` and `musiquiz-worker` now deploy from GitHub Actions (`deploy-workers.yaml`) on push to `main`. `musiquiz-static` stays on Cloudflare Workers Builds.

**`musiquiz-static` stays on Workers Builds for its deploy hook.** The Studio Deploy tab rebuilds it through `musiquiz-worker`, which calls the hook. The hook URL is the only credential, it lives in one Cloudflare Secret, and Cloudflare merges repeated clicks into one queued build.

- _All three on Actions, the button dispatching a workflow_ was rejected: the worker would hold a GitHub token able to run workflows, and the button would build outside Cloudflare.
- _All three on Workers Builds_ was rejected: the client's Cloudflare account cannot connect to this repo while it belongs to a personal GitHub account whose Cloudflare app is bound to another Cloudflare account.

**The repo moves to a GitHub organization later.** An organization gets its own Cloudflare app installation, linked to the client's account. Until then `musiquiz-static` has no Builds trigger and no hook: it is deployed by hand, and the Deploy tab fails.

**`account_id` is pinned in both `wrangler.jsonc`.** It is not a secret, and without it a local `wrangler deploy` goes to whichever account the CLI session picks.

**Deploy secrets are plain repository secrets**, like `SANITY_AUTH_TOKEN`. Fork pull requests never receive them. A `production` environment restricted to `main` was rejected for now: it only guards against someone with push access reading them from another branch, and only one person has it. Add it when that changes. Runtime secrets are set by hand with `wrangler secret put`; Actions never sees them.

## Consequences

- `musiquiz-static` builds on push from Workers Builds and the other two from Actions: two systems, one push, no ordering between them.
- No path filter and no checks before deploying, as in `deploy-sanity.yaml`. `ci.yaml` gates pull requests.
- Once static builds on Actions, if ever, its video encodes need an `actions/cache` on `apps/web/node_modules/.astro/`: Actions keeps nothing between runs.
