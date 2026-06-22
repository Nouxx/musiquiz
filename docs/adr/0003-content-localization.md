# Content localization: field-level with `locale*` object types

Localized content managed in Sanity uses **field-level localization** — a single document holds all languages — with translated fields modeled as custom **`locale*` object types** (`localeString`, `localeText`, `localeBlock`), each exposing one sub-field per language (`fr`, `en`). Non-translatable data (images, `correctIndex`, difficulty) stays as plain shared fields on the document.

```typescript
// question schema
defineField({name: 'correctIndex', type: 'number'}),  // shared
defineField({name: 'question', type: 'localeString'}),
defineField({name: 'explanation', type: 'localeBlock'}),
```

Queries use dot access with a `coalesce()` fallback to the base language:

```groq
"question": coalesce(question[$lang], question.fr)
```

## Why field-level over document-level

The site is a 1:1 FR/EN mirror published together, and a quiz question carries non-text data (audio clip, correct-answer index, cover art) that is identical across languages. Document-level localization (one document per language) would duplicate that shared media reference and invite drift when a clip is edited. Field-level keeps shared data authored once and makes publish atomic across languages — the mirror can never go live half-translated. The one pull toward document-level — Portable Text explanations — does not outweigh the shared-data cost at two mirrored languages.

## Why `locale*` objects over an internationalized array

With two stable languages and no planned growth, custom object types beat `sanity-plugin-internationalized-array`: no extra dependency, plain Studio fields, and dot-access GROQ (`question.fr`) instead of filter-access (`question[language == $lang][0].value`). The array's advantages — fixed attribute count and zero-schema-change language additions — only matter at many/growing languages, which is not this project.

## Consequences

- Adding a third language is a schema edit (a new sub-field on each `locale*` type) plus one new attribute per field — acceptable at this scale, deliberately traded away.
- The base language (`fr`) renders outside the translations fieldset (always visible); other languages sit in a collapsible fieldset to keep the form tidy.
- Typegen types a `locale*` field as an object (`{fr, en}`); query projections narrow it to a string/block via the `coalesce()` cast, so consuming code sees the resolved value, not the wrapper.
- If languages ever become many or grow continuously, revisit and migrate to the internationalized-array plugin.
