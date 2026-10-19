# jsonld-inspector

A local Astro dev toolbar app that shows every `<script type="application/ld+json">` on the current page, pretty-printed and checked. It has no dependencies and makes no network calls; everything runs in your browser during `astro dev`.

The icon gets a red dot (errors) or yellow triangle (warnings) when something's wrong, so you see problems without opening it.

## What it shows

- Each JSON-LD block with its `@type`s, syntax-highlighted source and a Copy button
- **Errors**: invalid JSON, missing `@context`, `@type` typos ("Blogposting"), Google-required properties missing, non-ISO dates, relative URLs, `undefined` / `[object Object]` leaking from templates, broken breadcrumb items
- **Warnings**: author as a plain string, empty values, HTML in `name`/`headline`, `@id` references that point to nothing on the page, conflicting `@id` types
- **Tips** (hidden by default, toggle in the header): recommended properties, http vs https, missing timezones

It re-scans when you open the panel, click **Rescan**, or navigate with View Transitions.

## Limits

It checks common Schema.org types and Google's rich-result rules offline. It doesn't load the full Schema.org vocabulary, so a property typo on an uncommon type won't be caught.

## Files

- `index.mjs`: the integration (registers the toolbar app in dev only)
- `app.mjs`: the toolbar UI
- `validate.mjs`: the validator (pure JS, also runs in Node, reusable for a build/CI check)
