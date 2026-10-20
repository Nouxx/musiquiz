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
  console.error("usage: node scripts/submitIndexNow.ts <directory>");
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

const keyLocation = `${origin}/${KEY}.txt`;

async function isKeyServed() {
  try {
    const response = await fetch(keyLocation, {
      signal: AbortSignal.timeout(10_000),
    });
    const body = await response.text();
    return response.ok && body.trim() === KEY;
  } catch {
    return false;
  }
}

// IndexNow reads an unverifiable host as spam: wait until the domain is live
if (!(await isKeyServed())) {
  console.log(`- ${keyLocation} not reachable yet, IndexNow skipped`);
  exit(0);
}

// the site is already deployed: a failed ping must not fail the build
try {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: KEY,
      keyLocation,
      urlList,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (response.ok) {
    console.log(`✓ ${urlList.length} urls submitted to IndexNow`);
  } else {
    console.warn(
      `⚠ IndexNow answered ${response.status} ${response.statusText} for ${urlList.length} urls: ${await response.text()}`,
    );
  }
} catch (error) {
  // fetch rejects with a bare "fetch failed", the reason is in cause
  const reason =
    error instanceof Error && error.cause instanceof Error
      ? error.cause
      : error;
  console.warn(
    `⚠ IndexNow submission failed for ${urlList.length} urls: ${reason instanceof Error ? reason.message : String(reason)}`,
  );
}
