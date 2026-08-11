import type { SanityConfig } from "@repo/utils/sanityConfig";
import { createClient } from "@sanity/client";

// todo: better to export the const or a function?
export function getSanityClient({ config }: { config: SanityConfig }) {
  const { projectId, dataset, draft = false, token } = config;

  // when draft is true, it means we expect the client to serve draft content
  // a token is required for that
  if (draft && !token) {
    throw new Error("A read token is required to fetch draft content");
  }

  return createClient({
    projectId,
    dataset,
    useCdn: false, // the site is either SSG or SSR for preview, we never need the CDN cache
    apiVersion: "2025-02-06",
    perspective: draft ? "drafts" : "published",
    token: draft ? token : undefined,
  });
}
