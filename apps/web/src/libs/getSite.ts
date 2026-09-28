export function getSite(astro: { site: URL | undefined }): URL {
  if (!astro.site) {
    throw new Error("`site` is missing from astro.config.mjs");
  }

  return astro.site;
}
