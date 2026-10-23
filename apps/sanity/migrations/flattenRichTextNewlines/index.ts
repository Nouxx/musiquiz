import { at, defineMigration, set } from "sanity/migrate";

type Span = { _type: "span"; text?: string };
type Block = { _type: "block"; children?: Span[] };

function isBlock(value: unknown): value is Block {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { _type?: unknown })._type === "block"
  );
}

// an empty paragraph without a newline is spacing someone authored, and stays
function isNewlineOnlyBlock(block: Block) {
  const spans = block.children ?? [];

  return (
    spans.every((span) => !span.text?.trim()) &&
    spans.some((span) => span.text?.includes("\n"))
  );
}

// a newline drew as a space until the renderer turned them into <br>, so flattening keeps every page as it was
function flatten(value: unknown): unknown {
  if (Array.isArray(value)) {
    const kept = value.filter(
      (item) => !(isBlock(item) && isNewlineOnlyBlock(item)),
    );

    // rich text requires one block, so a field holding nothing else keeps its last one
    return (kept.length > 0 ? kept : value).map(flatten);
  }

  if (typeof value !== "object" || value === null) return value;

  const record = value as Record<string, unknown>;

  if (record._type === "span" && typeof record.text === "string") {
    return { ...record, text: record.text.replace(/\s*\n\s*/g, " ") };
  }

  return Object.fromEntries(
    Object.entries(record).map(([key, child]) => [key, flatten(child)]),
  );
}

export default defineMigration({
  title: "Flatten newlines in rich text spans",
  migrate: {
    document(doc) {
      return Object.entries(doc)
        .filter(([key]) => !key.startsWith("_"))
        .filter(
          ([, value]) =>
            JSON.stringify(flatten(value)) !== JSON.stringify(value),
        )
        .map(([key, value]) => at(key, set(flatten(value))));
    },
  },
});
