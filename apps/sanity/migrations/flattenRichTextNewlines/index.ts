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

function isBlankBlock(block: Block) {
  return (block.children ?? []).every((span) => !span.text?.trim());
}

// a newline drew as a space until the renderer turned them into <br>, so flattening keeps every page as it was
function flatten(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .filter((item) => !(isBlock(item) && isBlankBlock(item)))
      .map(flatten);
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
