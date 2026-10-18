import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { argv, exit } from "node:process";

/**
 * Push every sitemap URL to IndexNow after a static deploy.
 * https://www.indexnow.org/documentation
 */
const ENDPOINT = "https://api.indexnow.org/indexnow";

// IndexNow verifies it at /<KEY>.txt, served from public/
const KEY = "cdbe55213bc1abb790180b15288ffcba";

const directory = argv[2];

if (!directory) {
  console.error("usage: node scripts/submitIndexNow.js <directory>");
  exit(1);
}

const keyPath = `${directory}/${KEY}.txt`;
const keyFile = existsSync(keyPath) ? await readFile(keyPath, "utf8") : "";

if (keyFile.trim() !== KEY) {
  console.error(
    `✗ ${keyPath} is missing or does not hold the key, IndexNow would reject it`,
  );
  exit(1);
}

const sitemap = await readFile(`${directory}/sitemap.xml`, "utf8");
const urlList = sitemap
  .matchAll(/<loc>([^<]+)<\/loc>/g)
  .map(([, loc]) => loc.replaceAll("&amp;", "&"))
  .toArray();

if (urlList.length === 0) {
  console.error(`✗ no <loc> in ${directory}/sitemap.xml, nothing submitted`);
  exit(1);
}

const { host, origin } = new URL(urlList[0]);

// a local build carries SITE_URL from .env.local
if (host.startsWith("localhost")) {
  console.log(`- ${host} build, IndexNow skipped`);
  exit(0);
}

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host,
    key: KEY,
    keyLocation: `${origin}/${KEY}.txt`,
    urlList,
  }),
});

// the site is already deployed: a rejected ping must not fail the build
if (!response.ok) {
  console.warn(
    `⚠ IndexNow answered ${response.status} ${response.statusText} for ${urlList.length} urls: ${await response.text()}`,
  );
  exit(0);
}

console.log(`✓ ${urlList.length} urls submitted to IndexNow`);
