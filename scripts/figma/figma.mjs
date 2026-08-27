#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  figma,
  fileKey,
  fileKeyFromUrl,
  loadEnv,
  nodeId,
  parseArgs,
} from "./lib.mjs";
import { render } from "./format.mjs";

const USAGE = `
figma <command> [ids…] [flags]

  tree <id…>       structure only — names, types, sizes, layout
  inspect <id…>    structure plus every style value
  image <id…>      export to PNG/SVG on disk
  raw <id…>        dump the untouched node JSON
  styles           the file's published text/fill/effect styles
  vars             local variables (Enterprise-only endpoint)

ids accept 184:2662, 184-2662, or a pasted figma.com URL.

  --file <key>     override FIGMA_FILE_KEY
  --depth <n>      stop descending (default 4 for tree/inspect, unlimited for raw)
  --out <dir>      where image/raw write (default ./figma-out)
  --format <fmt>   png | svg | pdf   (default png)
  --scale <n>      png scale         (default 2)
`.trim();

function ids(positional, flags) {
  const list = positional.map(nodeId);
  if (!list.length) throw new Error("no node id given");
  const keyFromUrl = positional.map(fileKeyFromUrl).find(Boolean);
  return { list, key: fileKey(flags.file ?? keyFromUrl) };
}

async function fetchNodes(key, list, depth) {
  const response = await figma(`/v1/files/${key}/nodes`, {
    ids: list.join(","),
    depth,
  });
  return list.map((id) => {
    const found = response.nodes[id];
    if (!found) throw new Error(`node ${id} not found in file ${key}`);
    return found.document;
  });
}

/* every variable binding on a node is an opaque id; one call maps them back to
   names, and it 403s outside Enterprise — a nameless render is still useful */
async function variableNames(key) {
  try {
    const { meta } = await figma(`/v1/files/${key}/variables/local`);
    return new Map(
      Object.entries(meta.variables).map(([id, variable]) => [
        id,
        variable.name,
      ]),
    );
  } catch {
    return undefined;
  }
}

async function commandRender(positional, flags, structureOnly) {
  const { list, key } = ids(positional, flags);
  const maxDepth = flags.depth === undefined ? 4 : Number(flags.depth);
  const nodes = await fetchNodes(key, list, maxDepth + 1);
  const names = structureOnly ? undefined : await variableNames(key);
  for (const node of nodes) {
    console.log(
      render(node, { maxDepth, structureOnly, variableNames: names }).join(
        "\n",
      ),
    );
  }
}

async function commandImage(positional, flags) {
  const { list, key } = ids(positional, flags);
  const format = flags.format ?? "png";
  const out = flags.out ?? "figma-out";
  const { images, err } = await figma(`/v1/images/${key}`, {
    ids: list.join(","),
    format,
    scale: format === "png" ? (flags.scale ?? 2) : undefined,
  });
  if (err) throw new Error(err);
  await mkdir(out, { recursive: true });
  for (const [id, url] of Object.entries(images)) {
    if (!url) {
      console.error(`${id}: figma returned no image (empty node?)`);
      continue;
    }
    const response = await fetch(url);
    const path = join(out, `${id.replace(":", "-")}.${format}`);
    await writeFile(path, Buffer.from(await response.arrayBuffer()));
    console.log(path);
  }
}

async function commandRaw(positional, flags) {
  const { list, key } = ids(positional, flags);
  const out = flags.out ?? "figma-out";
  await mkdir(out, { recursive: true });
  const nodes = await fetchNodes(key, list, flags.depth);
  for (const [index, node] of nodes.entries()) {
    const path = join(out, `${list[index].replace(":", "-")}.json`);
    await writeFile(path, JSON.stringify(node, null, 2));
    console.log(path);
  }
}

async function main() {
  loadEnv();
  const [command, ...rest] = process.argv.slice(2);
  const { positional, flags } = parseArgs(rest);

  switch (command) {
    case "tree":
      return commandRender(positional, flags, true);
    case "inspect":
      return commandRender(positional, flags, false);
    case "image":
      return commandImage(positional, flags);
    case "raw":
      return commandRaw(positional, flags);
    case "styles": {
      const { meta } = await figma(`/v1/files/${fileKey(flags.file)}/styles`);
      for (const style of meta.styles) {
        console.log(
          `${style.style_type.padEnd(6)} ${style.node_id.padEnd(12)} ${style.name}`,
        );
      }
      return;
    }
    case "vars": {
      const { meta } = await figma(
        `/v1/files/${fileKey(flags.file)}/variables/local`,
      );
      for (const variable of Object.values(meta.variables)) {
        const collection =
          meta.variableCollections[variable.variableCollectionId];
        for (const [modeId, value] of Object.entries(variable.valuesByMode)) {
          const mode = collection.modes.find((m) => m.modeId === modeId)?.name;
          console.log(
            `${collection.name}/${variable.name} [${mode}] ${JSON.stringify(value)}`,
          );
        }
      }
      return;
    }
    default:
      console.log(USAGE);
      process.exitCode = command ? 1 : 0;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
