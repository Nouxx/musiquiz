# Component layering and dependency direction

The web app is layered with a strict one-way dependency direction: **Route → Layout → Page → Feature Component → UI Component**, and UI Components depend only on other UI Components.

**Routes** (`apps/web/src/pages/`) exist one per locale because Astro's i18n needs a file per locale. A Route resolves params, picks a Layout and mounts a Page — no data, no markup, no `<style>`.

**Pages** (`apps/web/src/components/pages/`) fetch the data for one screen and compose Feature Components with it. One Page serves every locale's Route for that screen. This inner layer is why data fetching does not live in the routing files: putting it there would duplicate the whole page body across `/` and `/en/`, and that duplication would grow with every page and every locale.

**Feature Components** (`apps/web/src/components/features/`) own business logic and receive their data as props from a Page. They compose presentational **UI Components** (`packages/ui/src/`), which hold none, and carry no `<style>` of their own.

The one exception is **Site Chrome** — `Header` and `Footer` fetch their own data. Their content is site-wide settings belonging to no single page, so threading it through every Page would be noise for no isolation gain.

We chose this over the obvious "style anything anywhere" Astro default to keep the presentational layer reusable and the styling discipline enforceable.

## Consequences

- Page-level layout requires a Layout slot, not ad-hoc page CSS — slightly more wrappers, predictable structure.
- A UI Component is never allowed to import a Feature Component. This was once a `no-restricted-imports` lint rule; extracting the presentational layer into `packages/ui` made it redundant and it was dropped. The package boundary is the stronger guard — `packages/ui` does not depend on `apps/web`, so the import cannot resolve at all. The remaining edges of the layer graph (Route ↛ Feature, Page ↛ raw markup) are conventions, not machine-enforced.
- Adding a locale touches every Route file but no Page, Feature or UI Component.
