# Repo style

## Comments

Write few. Most code needs none.

- **Why, never what.** If the comment restates the line, delete it.
- **Only for the weird.** A comment earns its place when the code looks wrong
  until you know something: a workaround, a value that came from somewhere
  non-obvious, a rejected alternative, a constraint from a tool or a browser.
  Ordinary code gets nothing.
- **Direct.** Short sentences, no hedging, no throat-clearing. State the fact.
- **No section headers.** `/* --- helpers --- */` and friends are noise.
- **No narration of a diff.** Not "now uses X", not "changed from Y".

Test: cover the comment, read the code. Still obvious? Cut the comment.
Still surprising? Keep it, and make sure it explains the surprise.

Long-form reasoning does not belong in a comment. Decisions go in
`docs/adr/`, vocabulary goes in `CONTEXT.md`, and a comment links to them.

### Examples

```ts
// GOOD: give example, good only when not self explanatory
export type PriceTier = {
  /** @example "De 4 à 6 joueurs", "Tarif unique" */
  label: string;
};
```

```ts
// BAD: explain what it does where the code is enough
export type DetailCard = {
  icon: IconName;
  title: string;
  /** an optional lead-in above the highlight */
  intro?: string;
  highlight: string;
};

// BAD: add useless contextual info, this can drift with the code
export type DetailGroup = {
  /** the top label name */
  name: string;
  cards: DetailCard[];
};
```

```ts
  // BAD: too long
  /* the strip must never decide how tall its section is: the content beside it
     does, and a column of photos is several times taller than that. So the
     columns are lifted out of flow — an absolutely positioned layer contributes
     nothing to the grid row, and then fills whatever height the row settled on. */
  .columns {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: repeat(2, 260px);
    gap: var(--space-6);
  }

  // GOOD
  /* the content decides the section height, not the columns */
  .columns {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: repeat(2, 260px);
    gap: var(--space-6);
  }
```

## Functions

Declare with the `function` keyword. Never `const foo = () => {}`.
Applies across the monorepo, no exceptions.

## Where things are written down

- `CONTEXT.md` — the domain and design-system glossary, and the Figma access rules
- `docs/adr/` — decisions, with the alternatives that were rejected
- `packages/ui/src/styles/breakpoints.css` — every media-query literal and its derivation
