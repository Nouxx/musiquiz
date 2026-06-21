# MusiQuiz

A music quiz web app. This glossary fixes the vocabulary of the `apps/web` design system: the kinds of components, layouts, and styling tokens, and how they relate.

## Components

**UI Component**:
An agnostic, presentational component in `apps/web/src/components/ui/`. No business logic, no data fetching — props in, markup out. Composes only other UI Components. Example: `Text`, `Button`, `Card`.
_Avoid_: primitive, atom, dumb component

**Feature Component**:
A business-oriented component in `apps/web/src/components/features/`. Holds business logic / data and composes UI Components to render a domain concept. Example: `QuizCard`, `ScoreBoard`.
_Avoid_: business component, smart component, container, block, domain component

## Layouts

**Layout**:
A full page template in `apps/web/src/layouts/`. Defines page structure; a Page wraps its content in exactly one Layout.

**BaseLayout**:
The single document shell (`html`/`head`/`body`, global CSS imports, fonts, meta). Every other Layout wraps BaseLayout. Not a UI Component.

**PageLayout**:
A Layout that wraps BaseLayout and exposes content regions as named slots. The default page template; future siblings (e.g. other named layouts) follow the same pattern.

**Page**:
A route in `apps/web/src/pages/`. Pure composition: wraps a Layout and fills it with UI / Feature Components. A Page carries no scoped `<style>` and renders no styled raw markup.

## Styling

**Design Token**:
A CSS custom property that is the only sanctioned source of a styling value. Two tiers: a **Primitive Token** (raw palette value, e.g. `--blue-500`) and a **Semantic Token** (intent alias, e.g. `--color-accent`, `--text-title`) that points at a primitive. Components reference only Semantic Tokens.
_Avoid_: variable, theme value

**Theme**:
A set of Semantic Token values selected at runtime. The default theme lives on `:root`; alternate themes (e.g. dark) override Semantic Tokens under a `[data-theme="…"]` selector without touching components.
