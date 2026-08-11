# Content localization: field-level with `sanity-plugin-internationalized-array`

Localized content is **field-level** — a single document holds every language, so publishing is atomic and the FR/EN mirror can never go live half-translated. Translated fields are `internationalizedArrayString` from `sanity-plugin-internationalized-array`, configured once in `sanity.config.ts` with `languages: [en, fr]`, `defaultLanguages: ["fr"]` and `fieldTypes: ["string"]`. Queries read them by filter access:

```groq
"heading": heading[language == "fr"][0].value
```

An earlier draft of this ADR described custom `locale*` object types (`localeString`, `localeText`, `localeBlock`) with dot access and a `coalesce()` fallback, and argued against this plugin. That code was never written, so the document described an intention rather than a decision in force, and anyone following it would write `question.fr` and get `undefined`. It has been replaced by this one.

Adding a language is a config edit (`languages`) rather than a schema edit on every `locale*` type, and the Studio gets the plugin's array UI for free instead of hand-rolled fieldsets.

## Consequences

- Queries carry filter access, not dot access. Every localized projection is `field[language == $lang][0].value`. Verbose, and the shape leaks the plugin's storage model into every query.
- **There is deliberately no fallback.** No `coalesce()` appears anywhere in `packages/api` or `packages/services`, and none should be added. A missing translation is a content bug, and falling back to French would ship it to English visitors looking like a feature. Instead the Zod schemas in `packages/api/src/sanity/schema.ts` are strict (`z.string().min(1)`), `fetchSanityData` parses every response, and an untranslated field projects `null` and throws — so `astro build` fails loudly rather than rendering a half-French page. Fields that are genuinely optional opt out explicitly with `.nullable()`, as `pageCoverBadge` does.
- The flip side of failing loudly: the SSR preview build runs the same parse at request time, so an editor previewing a half-translated draft gets a 500 rather than a partial page. That is the intended signal — the translation is missing — but it is a hard stop, not a warning.
- `fieldTypes: ["string"]` is the only registered type, so `internationalizedArrayString` is the only localized field available. Localized Portable Text or plain-text areas need that array extended first.
- Typegen types a localized field as an array of `{_key, value}`; the projection narrows it to a string, so consuming code sees the resolved value rather than the wrapper.
- Localized `alt` on the `cmsImage` type (ADR 0004) uses this same mechanism.
