// Every strong reference to the given ids, published and draft. Read-only.
import { parseArgs, query, strongRefPaths } from "./lib.mjs";

const { positional: ids } = parseArgs(process.argv.slice(2));
if (!ids.length) throw new Error("usage: strong-refs <id…>");

for (const id of ids) {
  const referrers = await query(`*[references($id)]`, { id });
  const lines = referrers.flatMap((doc) =>
    strongRefPaths(doc, new Set([id])).map(
      ({ path }) => `  ${doc._id}  ${doc._type}  ${path}`,
    ),
  );
  console.log(`${id}: ${lines.length ? "" : "none"}`);
  for (const line of lines) console.log(line);
}
