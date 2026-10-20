# Localized fields require every language

Every Sanity field of an `internationalizedArray…` type is validated by `apps/sanity/src/schemas/shared/localized.ts`, never by `rule.required()`.

The value is an array of `{ language, value }` entries. `rule.required()` only checks that the array is not empty, and `defaultLanguages` seeds an empty entry, so it passed with no text in any language. Editors published fields missing EN, or FR, and the build broke on the page that read them.

- A required field uses `requiredInEveryLanguage()`: FR and EN both filled. It takes an optional condition on the validation context, for fields required only in some states (an enabled pop-up, an offer card in text mode).
- An optional field uses `noMissingLanguage`: every language or none. A field filled in one language renders empty in the other.
- Filled means non-whitespace text. For rich text, at least one span has some.
- Both are errors, so they block publishing. Length and SEO checks stay warnings, in a separate rule: `.warning()` downgrades a whole chain.
- `defaultLanguages` is `["fr", "en"]`, so editors see both rows before they see an error.

## Consequences

`apps/sanity/src/schemas/localized.test.ts` walks the schema and fails when a localized field accepts a value filled in FR only. A new field with a bare `rule.required()`, or no validation, fails it.

## Alternative: plugin configuration

`sanity-plugin-internationalized-array` has no per-language required option.

## Alternative: rewrite `required()` in a global schema pass

Works, but the rule disappears from the field definition.

## Alternative: fall back to FR on `/en` in the build

Hides gaps: an English page in French.

## Alternative: exempt fields the build can fall back on (SEO)

A half-filled field is a mistake far more often than a choice, and one rule keeps the test simple.
