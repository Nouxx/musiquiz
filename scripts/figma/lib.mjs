import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../../", import.meta.url).pathname;

export function loadEnv() {
  for (const file of [".env", ".env.local"]) {
    const path = join(ROOT, file);
    if (existsSync(path)) process.loadEnvFile(path);
  }
}

export function token() {
  const value = process.env.FIGMA_TOKEN;
  if (!value) {
    throw new Error(
      "FIGMA_TOKEN missing. Create a personal access token at " +
        "https://www.figma.com/settings (scopes: file_content:read, file_metadata:read) " +
        "and add FIGMA_TOKEN=... to .env.local",
    );
  }
  return value;
}

export function fileKey(override) {
  const value = override ?? process.env.FIGMA_FILE_KEY;
  if (!value)
    throw new Error("no file key: pass --file, or set FIGMA_FILE_KEY in .env");
  return value;
}

/** accepts `184:2662`, `184-2662`, or any figma.com URL carrying a node-id */
export function nodeId(input) {
  const fromUrl = input.match(/node-id=([0-9]+[:-][0-9]+)/);
  const raw = fromUrl ? fromUrl[1] : input;
  return raw.replace("-", ":");
}

export function fileKeyFromUrl(input) {
  return input.match(/figma\.com\/(?:file|design)\/([A-Za-z0-9]+)/)?.[1];
}

export async function figma(path, params = {}) {
  const url = new URL(`https://api.figma.com${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  const response = await fetch(url, { headers: { "X-Figma-Token": token() } });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `${response.status} ${response.statusText} on ${url.pathname}\n${body}`,
    );
  }
  return response.json();
}

export function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) flags[key] = true;
      else flags[key] = (i++, next);
    } else {
      positional.push(argv[i]);
    }
  }
  return { positional, flags };
}
