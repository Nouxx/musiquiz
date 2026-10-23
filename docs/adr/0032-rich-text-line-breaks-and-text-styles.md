# Rich Text line breaks and text styles

Editors could only bold text, and had no way to break a line without starting a new paragraph. Enter starts a new block, and each block is drawn as its own `<p>` with a gap. Shift+Enter puts a `\n` in the span, but the renderer drew it as a space.

**Shift+Enter is a line break.** `RichTextSpans` draws each `\n` as a `<br>`. Services collapses a run of breaks into one and drops breaks at the start and end of a paragraph, so a gap only ever comes from Enter. Every Rich Text field description says so.

**Four text styles**: bold, italic, underline and strikethrough. Sanity decorators `strong`, `em`, `underline` and `strike-through` are drawn as `<strong>`, `<em>`, `<u>` and `<s>`. They are defined once, as `richTextDecorators`, and shared by Rich Text, Article Body, its table cells and the blog summary. Spans carry them as flat booleans, the same as `bold`.

## Underline looks like a link

Links are underlined, so an underlined word will look clickable. The client asked for underline anyway. Kept as asked.

Rejected: dropping underline, or drawing it differently from a link (thicker or offset). The client wants it, and the editors are the ones choosing where it goes.

## Italic is synthesized

Funnel Display has no italic face on Google Fonts. The browser slants the upright face. Synthesized bold is avoided (`font-weight: 600`, a real face), but a slanted sans reads well enough.

Rejected: a different emphasis such as weight or colour, which would no longer be italic.

## Existing `\n` were flattened

Before this change, 212 spans already held a `\n`, mostly from imported copy. They drew as spaces. Rendering them as breaks would have changed pages nobody edited. The `flattenRichTextNewlines` migration replaced them with spaces and dropped the blocks that held only a `\n`.

Rejected: keeping them as breaks, or splitting `\n\n` into paragraphs. Both guess at a layout the copy never had.

## Consequences

- A break at the edge of a span next to another span's break still draws two `<br>`. Rare enough to leave.
- Plain-text consumers, such as the FAQ JSON-LD, now see `\n` in the text.
