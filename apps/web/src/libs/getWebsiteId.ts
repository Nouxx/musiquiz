export function getWebsiteId(site: URL) {
  return new URL("#website", site).href;
}
