# MusiQuiz

A music quiz web app. This glossary fixes the vocabulary of the `apps/web` design system: the kinds of components, layouts, and styling tokens, and how they relate.

Musiquiz is a entertainment business that operates in France and provide various activites around music. Its a physical business with real places and this project is just the website to advertise about it and let users reserve their sessions.

## Components

**UI Component**:
An agnostic, presentational component in `packages/ui/src/`. No business logic, no data fetching — props in, markup out. Composes only other UI Components. Example: `Text`, `Button`, `Card`.
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

## Images

**CMS Image**:
An image authored in Sanity by an editor. Its bytes are pulled in at build time and shipped as part of the site, so a published site keeps rendering its images whether or not Sanity is reachable. Sanity is the source of an image, never its server.
_Avoid_: remote image, Sanity image, CDN image

**Local Asset**:
An image committed to the repo alongside the code, not authored by an editor. Fixed for a given deploy; changing one is a code change, not a content change.
_Avoid_: static image

**Source Image**:
The single rendition of a CMS Image that the build pulls from Sanity and treats as its master copy. Everything the site serves for that image is derived from it, so its resolution sets the ceiling on what any visitor can ever be served.

**Remote Image**:
The UI Component that renders an image whose bytes come from outside the repo. It knows nothing of Sanity — it is handed a plain description of an image and decides how to serve it. The counterpart for a Local Asset is Astro's own image component; Remote Image is not used for those.

**Logo**:
A brand mark of the business, owned by site settings and editable without a developer. There are exactly two — the **Header Logo** and the **Footer Logo** — and they are different artwork, not two copies of one mark. No other document owns a logo; a page that shows one shows one of these.

**Image Variant**:
A named rendering intent — `logo`, `payment-icon`, `cover` — that a call site picks when it uses a Remote Image. It says what role the image plays on the page, never what size it is. The variant is what binds an image to the layout that sizes it, so the set is closed and lives beside that layout.
_Avoid_: image size, image preset

## Styling

**Design Token**:
A CSS custom property that is the only sanctioned source of a styling value. Two tiers: a **Primitive Token** (raw palette value, e.g. `--blue-500`) and a **Semantic Token** (intent alias, e.g. `--color-accent`, `--text-title`) that points at a primitive. Components reference only Semantic Tokens.
_Avoid_: variable, theme value

**Theme**:
A set of Semantic Token values selected at runtime. The default theme lives on `:root`; alternate themes (e.g. dark) override Semantic Tokens under a `[data-theme="…"]` selector without touching components.
