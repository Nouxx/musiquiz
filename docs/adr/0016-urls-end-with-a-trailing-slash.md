# Every page URL ends with a trailing slash

Every page URL the site links to ends with `/`: `/paris/`, `/paris/reserver/`, `/blog/<slug>/`. Search engines accept either form as long as each page has exactly one; the slash form is the one Astro and Cloudflare already serve by default, so it costs no configuration.

**The build decides the served form.** [`build.format`](https://docs.astro.build/en/reference/configuration-reference/#buildformat) is left at its default, `"directory"`, so every page is written as `<path>/index.html`. The static worker deployed on Cloudflare leaves [`assets.html_handling`](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/#automatic-trailing-slashes-default) at its default, `"auto-trailing-slash"`, which serves a folder index **with** a slash and answers the slash-less request with a **307** ([Cloudflare: HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)). Measured with `wrangler dev --env static` on `dist/static`:

```
/contact            -> 307 /contact/
/contact/           -> 200
/contact/index.html -> 307 /contact/
/contact/index      -> 307 /contact/
```

Cloudflare's table lists `/folder/index` and `/folder/index.html` as `307 to /folder`, which would chain into a second 307. The runtime redirects straight to `/folder/`; the table is wrong, the section's own intro ("folder index files … served _with_ a trailing slash") is right.

**A slash-less link costs a temporary redirect.** A 307 is a weak canonicalization signal, and every internal link that triggers one wastes a hop. The served form is fixed by the two defaults above; what the site controls is its links, so `getRoutesForLang` is where the rule lives.

**`trailingSlash: "always"` aligns dev and preview, not production.** Astro applies it to dev (a warning page on a mismatch) and to on-demand routes, which the SSR preview worker is (301 on GET); "prerendered pages handle trailing slashes via hosting platform configuration" ([Astro: `trailingSlash`](https://docs.astro.build/en/reference/configuration-reference/#trailingslash)). Astro recommends pairing it with `"directory"`.

## Considered options

- _No slash_ (`build.format: "file"` + `trailingSlash: "never"`): as valid for search engines, but it moves two defaults for no gain.
- _`trailingSlash: "ignore"`_ (Astro's default): dev accepts both forms, so a slash-less link only shows up as a 307 in production.
- _`html_handling: "force-trailing-slash"`_: same result as `auto-trailing-slash` for a site made only of folder indexes. Not worth an override.

## Consequences

- Every route in `getRoutesForLang` ends with `/`, guarded by a test.
- `astro.config.mjs` sets `trailingSlash: "always"`.
- The build-time SEO check (`docs/temp/seo-audit.md`, guard rails) fails on any internal link without a trailing slash.
- `musiquizlejeu.fr` uses the same form, so paths kept identical in the domain move can share one "same path on the new host" redirect rule.
- Revisit if a page is ever built as a file (`build.format: "file"` or `"preserve"`): `auto-trailing-slash` would then serve it _without_ a slash.
