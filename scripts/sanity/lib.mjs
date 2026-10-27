import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const ROOT = new URL("../../", import.meta.url).pathname;
const API_VERSION = "v2025-01-01";

export const OWNED_TYPES = [
  "venuePage",
  "venueGame",
  "venueEvent",
  "venueBlog",
  "venueCustomPage",
  "venuePopup",
];

for (const file of [".env", ".env.local"]) {
  const path = join(ROOT, file);
  if (existsSync(path)) process.loadEnvFile(path);
}

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;

// the env token is read-only and blind to drafts; `sanity login` stores a user token here
function token() {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN;
  const config = join(homedir(), ".config/sanity/config.json");
  const value = existsSync(config)
    ? JSON.parse(readFileSync(config, "utf8")).authToken
    : undefined;
  if (!value) throw new Error("no Sanity user token: run `npx sanity login`");
  return value;
}

async function sanity(path, init = {}) {
  const url = `https://${projectId}.api.sanity.io/${API_VERSION}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(
      `${response.status} on ${path.split("?")[0]}\n${await response.text()}`,
    );
  }
  return response.json();
}

export async function query(groq, params = {}) {
  const search = new URLSearchParams({ query: groq, perspective: "raw" });
  for (const [key, value] of Object.entries(params)) {
    search.set(`$${key}`, JSON.stringify(value));
  }
  const { result } = await sanity(`/data/query/${dataset}?${search}`);
  return result;
}

export async function mutate(mutations) {
  return sanity(`/data/mutate/${dataset}?returnIds=true`, {
    method: "POST",
    body: JSON.stringify({ mutations }),
  });
}

export function publishedId(id) {
  return id.replace(/^drafts\./, "");
}

/** every strong reference to `targets` inside `doc`, as a mutation path */
export function strongRefPaths(doc, targets) {
  const paths = [];

  function walk(node, path) {
    if (Array.isArray(node)) {
      node.forEach((item, index) =>
        walk(item, `${path}[${item?._key ? `_key=="${item._key}"` : index}]`),
      );
      return;
    }
    if (!node || typeof node !== "object") return;
    if (targets.has(node._ref) && !node._weak)
      paths.push({ path, ref: node._ref });
    for (const [key, value] of Object.entries(node)) {
      if (!key.startsWith("_")) walk(value, path ? `${path}.${key}` : key);
    }
  }

  walk(doc, "");
  return paths;
}

const SYSTEM_FIELDS = new Set([
  "_id",
  "_rev",
  "_updatedAt",
  "_createdAt",
  "_originalId",
  "_system",
]);

/** a doc's content, without the fields a save or a weakened ref changes */
export function content(doc) {
  return JSON.parse(
    JSON.stringify(doc, (key, value) =>
      SYSTEM_FIELDS.has(key) ||
      key === "_weak" ||
      key === "_strengthenOnPublish"
        ? undefined
        : value,
    ),
  );
}

export function parseArgs(argv) {
  const positional = argv.filter((arg) => !arg.startsWith("--"));
  const flags = new Set(argv.filter((arg) => arg.startsWith("--")));
  return { positional, flags };
}
