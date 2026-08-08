# Icons are inlined SVG owned by the repo, not images

An **Icon** is a small vector mark committed to `packages/ui/src/icons/`, imported as a raw string and written into the page as inline `<svg>` by the `Icon` UI Component. It is not a Local Asset in ADR 0004's sense: it never goes through Astro's image pipeline and never becomes an `<img>`.

The reason is recolouring. Icons appear on a cream chip and on the blue footer gradient in the same design, and an `<img>` cannot invert — it would need one file per colour, forever. Inline SVG inherits `currentColor` from whatever it sits in, so one file serves every context. Everything else about the approach follows from that one requirement.

Icons render server-side into static HTML, so the whole set costs **zero** client JavaScript and zero extra requests. Only icons a page actually references reach its markup, which is why the set is the full Figma sheet (45) rather than the handful in use today — an unreferenced icon is inert.

## Why the files look the way they do

Every file is normalised to a single shape: `<svg viewBox="0 0 24 24" xmlns="…">` and nothing else on the root, one indented `<path>` per line.

- **No `width`/`height`.** Size is a `size` prop mapped to a CSS length, so intrinsic dimensions on the file would only fight it.
- **No `fill` on monochrome paths.** `Icon` sets `fill: currentcolor` on the `<svg>` and the paths inherit it.
- **No `fill="none"` on the root**, which every Figma export carries. Left in place it would be inherited by paths that no longer declare their own fill, and every icon would render invisible. The CSS rule happens to override it, but a file that is only correct because of a stylesheet elsewhere is a trap.
- **`flag-france` keeps its three literal fills** — they are the artwork, not a default. It survives recolouring because a presentation attribute on an element beats a value _inherited_ from an ancestor. This is why the rule must target the `<svg>` and never `.ui-icon path`: a descendant selector would out-specify those attributes and flatten the flag into a silhouette.

The uniform root tag is load-bearing. `Icon` splices its own attributes in by replacing that exact known prefix, which is an edit to a shape we control rather than a guess at arbitrary markup.

## Consequences

- **The `Icon` stylesheet is global, not scoped.** Astro's scoping is compile-time: it stamps `data-astro-cid-*` onto elements in the component template. Markup arriving through `set:html` never gets that attribute, so a scoped rule would compile to a selector that cannot match its own SVG. The rule is `is:global` under a `ui-` prefixed class, and the per-instance size comes in as a custom property on an inline `style`, per ADR 0002's Primitive pattern.
- **Each icon is imported by name, not globbed.** `import.meta.glob` is typed `Record<string, string>`, so `keyof typeof` would widen to `string` and every misspelled `name` would type-check and fail at runtime. Forty-five explicit imports buy a literal union, autocomplete, and a compile error on a typo. Adding an icon is two lines.
- **`?raw` needs an ambient declaration** (`packages/ui/src/svg.d.ts`). Those types normally come from `vite/client`, but `packages/ui` does not depend on vite directly — astro owns it — so under pnpm's strict linking the types cannot be resolved by name.
- **Icons are always decorative** — unconditionally `aria-hidden` with no label prop. An accessible name belongs to the control, not its ornament, so an icon-only link is named by `Link`'s `label`. The cost is that a bare `<Icon>` with no surrounding control is invisible to assistive tech, which is the correct default and a bug anywhere it happens.
- **Two icon systems coexist in the footer, deliberately.** The payment marks (Visa, Amex, Mastercard, ANCV) are editor-owned content and stay CMS Images through `RemoteImage` under ADR 0004. The rule is ownership, not appearance: if a non-developer must be able to change it, it is a CMS Image.
- **Sizes are local values, not tokens.** The Figma icon boxes are 14/18/20/24px; 14 and 18 are not steps on the `--space-*` scale, and nothing but icons reads them. Minting `--icon-*` tokens for one consumer would add a tier without adding reuse.
- **Re-exporting from Figma is not drop-in.** A fresh export arrives with `width`, `height`, hardcoded fills, `fill="none"` and a spaced PascalCase filename; it must be renamed and normalised before it is usable. This is currently a manual pass.
