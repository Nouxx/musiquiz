# MusiQuiz

A music quiz web app. This glossary fixes the vocabulary of the `apps/web` design system: the kinds of components, layouts, and styling tokens, and how they relate.

Musiquiz is a entertainment business that operates in France and provide various activites around music. Its a physical business with real places and this project is just the website to advertise about it and let users reserve their sessions.

## Domain

**Venue**:
One physical Musi'Quiz location, addressed by a slug under `/[venue]`. A city is an attribute of a Venue, not a synonym for one — a city may hold more than one Venue. Its French UI label is "centre"; that label is copy, and the code says Venue everywhere.
_Avoid_: centre, ville, city, site, location

## Components

**UI Component**:
An agnostic, presentational component in `packages/ui/src/`. No business logic, no data fetching — props in, markup out. Composes only other UI Components. Example: `Text`, `Button`, `Card`.
_Avoid_: primitive, atom, dumb component

**Feature Component**:
A business-oriented component in `apps/web/src/components/features/`. Holds business logic / data and composes UI Components to render a domain concept. Example: `QuizCard`, `ScoreBoard`. It carries no `<style>` of its own — everything it renders is a UI Component.
_Avoid_: business component, smart component, container, block, domain component

**Rolling Banner**:
A full-bleed strip holding one short message, repeated as many times as the width needs and scrolled horizontally without end. The repetition is a layout mechanic, never content — every copy says the same thing, which is why only the first is readable to assistive tech. How the copy count is decided is [ADR 0008](./docs/adr/0008-rolling-banner-fill-strategy.md).
_Avoid_: marquee, ticker, carousel, news bar

**Site Chrome**:
The one kind of Feature Component that fetches its own data instead of receiving it from a Page — `Header`, `Footer`. Its content is site-wide settings, so it belongs to no single page and threading it through every Page would be noise. Any other Feature Component takes its data as props.

## Layouts

**Layout**:
A page template in `apps/web/src/layouts/`. A Route wraps its Page in exactly one Layout. Not a UI Component.

`Layout` is the document shell — `html`/`head`/`body`, global CSS imports, fonts, meta — and every other Layout wraps it. `VenueLayout` is its only sibling today: it wraps `Layout` and puts the venue `Header` above the Page. Layouts differ from one another by the Site Chrome they add, not by named slots.

**Route**:
A file in `apps/web/src/pages/`. A per-locale entry point that exists only because Astro's i18n needs one file per locale. It resolves params, picks a Layout, and mounts a Page — nothing else. No data, no markup, no `<style>`.
_Avoid_: page

**Page**:
A component in `apps/web/src/components/pages/`. Fetches the data for one screen and composes Feature Components with it. One Page serves every locale's Route for that screen, which is why it is not the routing file. A Page carries no scoped `<style>` and renders no styled raw markup.

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

**Icon**:
A small vector mark committed to `packages/ui/src/icons/` and written into the page as inline SVG, so it takes its colour from whatever it sits in. Not a Local Asset: it never touches the image pipeline and never becomes an `<img>`. Icons are code, never content — anything an editor must be able to change is a CMS Image, which is why the footer's payment marks are not Icons despite looking like them.
_Avoid_: glyph, symbol, pictogram, svg

**Image Variant**:
A named rendering intent — `logo`, `payment-icon`, `cover` — that a call site picks when it uses a Remote Image. It says what role the image plays on the page, never what size it is. The variant is what binds an image to the layout that sizes it, so the set is closed and lives beside that layout.
_Avoid_: image size, image preset

## Styling

**Design Token**:
A CSS custom property that is the only sanctioned source of a styling value. Two tiers: a **Primitive Token** (raw palette value, e.g. `--blue-900`) and a **Semantic Token** (intent alias, e.g. `--color-accent`) that points at a primitive. Components reference only Semantic Tokens. **Type Tokens** are the exception — they are single-tier and named for the typography steps in Figma, see below.
_Avoid_: variable, theme value

**Type Token**:
A single-tier token naming one step of the Figma typography sheet — `--title-h1` … `--title-xs`, `--paragraph-xl` … `--paragraph-xs`, each with a `-sm` semibold companion for paragraphs. Figma's step names are kept verbatim so a design conversation needs no translation, and the token holds the whole `font` shorthand. Components never name a step directly; they pass one to `Text`'s `variant`.

**Color Token**:
Primitives are the Figma colour sheet's palette translated to English — `Rouge 500` → `--red-500`, `Bleu 900` → `--blue-900`, `Dégradé rouge` → `--gradient-red`. Semantics are a small closed set of **roles** (surface, text, accent, border, and their on-media counterparts), never one token per component; a new component reuses roles rather than minting names.

**Rôle mapping** (Figma → code): Noir → `black`, Blanc → `white`, Rouge → `red`, Vert → `green`, Bleu → `blue`, Jaune → `yellow`, Gris → `grey`, Dégradé → `gradient`, Dégradé de contours → `gradient-border`, Dégradé de fonds → `gradient-surface`.

**Theme**:
A set of Semantic Token values selected at runtime. The default theme lives on `:root`; alternate themes (e.g. dark) override Semantic Tokens under a `[data-theme="…"]` selector without touching components.
