import { readdir, readFile } from "node:fs/promises";
import { argv, exit } from "node:process";

/**
 * Analyze a directory (static build artifacts = /dist) and fails if a page still links to the Sanity CDN.
 * Astro only downloads and bundles a remote image if its host is in
 * `image.domains`. If it is not, Astro keeps the original url with no warning.
 */
const FORBIDDEN_HOST = "cdn.sanity.io";

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  const files = await Promise.all(
    entries.map((entry) => {
      const path = `${directory}/${entry.name}`;

      if (entry.isDirectory()) return findHtmlFiles(path);

      return entry.name.endsWith(".html") ? [path] : [];
    }),
  );

  return files.flat();
}

const directory = argv[2];

if (!directory) {
  console.error("usage: node scripts/assertBundledImages.js <directory>");
  exit(1);
}

const htmlFiles = await findHtmlFiles(directory);

if (htmlFiles.length === 0) {
  console.error(`✗ no html found in ${directory}, nothing was checked`);
  exit(1);
}

const offenders = [];

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");

  if (html.includes(FORBIDDEN_HOST)) offenders.push(file);
}

if (offenders.length > 0) {
  console.error(
    `✗ ${offenders.length} of ${htmlFiles.length} pages still link to ${FORBIDDEN_HOST}, so the deployed site would depend on Sanity being up:`,
  );

  // leading empty space for terminal formatting
  for (const offender of offenders) console.error(`  ${offender}`);

  console.error(`check that ${FORBIDDEN_HOST} is listed in image.domains`);
  exit(1);
}

console.log(
  `✓ ${htmlFiles.length} pages checked, none link to ${FORBIDDEN_HOST}`,
);
