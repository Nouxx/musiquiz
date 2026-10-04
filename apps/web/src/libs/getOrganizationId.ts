export function getOrganizationId(site: URL) {
  return new URL("#organization", site).href;
}
