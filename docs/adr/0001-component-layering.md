# Component layering and dependency direction

`apps/web` components are layered with a strict one-way dependency direction: **Page → Layout → Feature Component → UI Component**, and UI Components depend only on other UI Components.

Feature Components (`src/components/features/`) own business logic and data and compose presentational UI Components (`src/components/ui/`), which hold none.

Pages (`src/pages/`) are pure composition — no scoped `<style>`, no styled raw markup; all page structure comes from a Layout (`src/layouts/`), and page layout specifically from `PageLayout`'s named slots.

We chose this over the obvious "style anything anywhere" Astro default to keep the presentational layer reusable and the styling discipline enforceable: a future second app (or extracting `ui/` to `packages/ui`) stays cheap because UI Components have no upward dependencies.

## Consequences

- Page-level layout requires a Layout/`PageLayout` slot, not ad-hoc page CSS — slightly more wrappers, predictable structure.
- A UI Component is never allowed to import a Feature Component; the reverse is the only legal direction. Enforced at lint time via `no-restricted-imports` scoped to `**/components/ui/**` in `packages/eslint-config/base.js` (matches the import specifier `**/features/**`). This guards only the `ui ↛ features` edge today; the full layer graph is not yet machine-enforced.
