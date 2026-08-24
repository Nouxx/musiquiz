# MusiQuiz

A music quiz web app. This glossary fixes the vocabulary of the `apps/web` design system — the kinds of components, layouts, and styling tokens, and how they relate — and of the data layer that feeds it.

Musiquiz is a entertainment business that operates in France and provide various activites around music. Its a physical business with real places and this project is just the website to advertise about it and let users reserve their sessions.

## Domain

**Venue**:
One physical Musi'Quiz location, addressed by a slug under `/[venue]`. A city is an attribute of a Venue, not a synonym for one — a city may hold more than one Venue. Its French UI label is "centre"; that label is copy, and the code says Venue everywhere. A Venue holds only facts about the place — address, opening hours, contact, logo — and owns no page content; what a visitor reads lives in a Venue Page, a Venue Game or a Venue Event. [ADR 0010](./docs/adr/0010-page-content-lives-in-documents.md).
_Avoid_: centre, ville, city, site, location

**Game Format**:
A kind of game the business runs, named and slugged once for the whole company — "Musi'Quiz", "Pixel Games". It is the same product in Lille and in Pau, which is why it carries no marketing copy and no price: those differ per Venue and belong to a Venue Game. Its `displayOrder` fixes the order games appear in wherever they are listed, at every Venue.
_Avoid_: game, game type, product

**Event Format**:
The same idea as a Game Format for the evergreen occasions a Venue markets — "bachelor party". Not dated and not scheduled: an Event Format is standing marketing material, so nothing about it expires.
_Avoid_: event, occasion, session

**Venue Game**:
One document saying this Venue sells this Game Format, holding the price and the whole page a visitor reads at `/[venue]/jeux/[game]`. It is the single place that fact is asserted — a Venue does not separately list which games it offers, and a Venue Game with no matching page does not exist. Uniqueness of the (Venue, Game Format) pair is validated on the document.
_Avoid_: offering, venue game page, game page

**Venue Event**:
A Venue Game for Event Formats, serving `/[venue]/evenements/[event]`. It carries no price. It is a separate document type rather than a Venue Game with a flag, because a discriminator would make `price` and the reference target conditional. [ADR 0010](./docs/adr/0010-page-content-lives-in-documents.md).
_Avoid_: offering, event page

**Venue Page**:
The document holding one of a Venue's three fixed screens — its home page, its gift page, its booking page — distinguished by a `pageType`. All three have identical shape, so they are one document type; the enum names a route, never a field that only some of them have. It is content, and the component that renders it is a Page.
_Avoid_: page, page document, venue content, screen

## Page Content

Every page of the site is a document, and every one of those documents has exactly these two things and differs only in what else it carries.

**Page Cover**:
The block at the top of every page — media, badge, heading, sub-heading, and a call-to-action label. The call to action's **label** is content; its **destination is not**. Where the button goes is decided in code from the page's kind, so `getRoutesForLang` stays the only source of routing truth and an editor cannot author a URL that skips the locale prefix or 404s. Authored as one object type reused across every content document, rendered by the `PageCover` UI Component.
_Avoid_: hero, banner, header, masthead

**Page Component**:
One entry in the ordered array an editor composes a page body from — a Rolling Banner or a Cards Grid today, more later. The array is the same shared dictionary on every content document, so a component written for one page works on all of them.
_Avoid_: block, section, module, widget

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

**Cards Grid**:
A Page Component holding a heading, a body, an optional call to action, and three or four Cards. The count is the design variant, not just a length — it sets the column gap, the track template and the Card's title step, so a fourth card is a different design rather than one more of the same. Unlike a Page Cover, a Cards Grid's calls to action carry an authored, localized url: they point at pages the site does not own routes for, so the destination cannot be derived and an authored url can 404.
_Avoid_: card list, tiles, features grid

**Card**:
The UI Component inside a Cards Grid — media, badge, title, optional body, optional call to action, on a light surface inside a gradient ring. Every Card in a grid is the same width and height whatever it holds; the media is a fixed 240px crop and the call to action is pinned to the bottom edge, so a row of Cards lines up whatever the bodies do.
_Avoid_: tile, panel, box

**FAQ**:
A Page Component pairing a set of questions with a strip of photos. Only one answer is open at a time, which is the `name` attribute on `<details>` doing it and not a script — so the whole section works with JavaScript off. The photo strip is decoration: it is two columns drifting past each other, it never decides how tall the section is, and it is not rendered at all below the width where it fits. Questions are authored on the page that shows them, so a venue's answers can name its city; there is no shared question set.
_Avoid_: accordion (that is the UI Component inside it), questions block, help section

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

## Data

**Query Module**:
One file in `packages/api/src/sanity/`, holding everything one fetch needs: its GROQ query, the Zod schema that parses the response, the inferred `Sanity*` type, and the fetch function built from the two. There is one per fetch, named after it, and it mirrors one `getXData.ts` in `@repo/services`. A Query Module exposes a call, never a query fragment — the schema stays inside it. Its rules are [ADR 0009](./docs/adr/0009-sanity-query-modules.md).
_Avoid_: query, fetcher, endpoint, resource, api feature

**Adapted Content**:
What `@repo/services` returns: content that came out of the CMS, reshaped for the front end — a Sanity image asset turned into a `CmsImage`, a localized array narrowed to the string for the requested language, a reference resolved into the fields that use it. Transforming it is the job; inventing it is not.
_Avoid_: view model, DTO, presenter

**Rich Text**:
Authored content that is more than one string — paragraphs, bold, links, and nothing else. Sanity stores it as Portable Text and that format stops at `@repo/services`: what the front end receives is a flat list of paragraphs holding spans, each already carrying its own `bold` and `href`. Resolving a span's marks is a join against the block's `markDefs`, done once in services so no UI Component ever learns what a `markDef` is.
_Avoid_: portable text, block content, body, HTML

`@repo/services` returns **CMS content only, never interface copy.** A string the editor did not author — a label, a unit, a derived phrase like "De 4 à 6 joueurs" — belongs to the web app, in `apps/web/src/locales/`, reached through `getT(lang)`. So services hands over the values (`playerCountFrom`, `amount`) and the web app turns them into words. This is why `adaptPageComponent` takes no `lang`: the language decides how content is _selected_ inside a Query Module's projection, and how copy is _written_ in the web app, and nothing in between needs it.

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
