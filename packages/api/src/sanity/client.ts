import { createClient } from "@sanity/client";

// todo: better to export the const or a function?
export function getSanityClient({
  projectId,
  dataset,
  draft = false,
  token,
}: {
  projectId: string;
  dataset: string;
  /** read unpublished content — only the preview build should ask for this */
  draft?: boolean;
  token?: string;
}) {
  // failing loudly beats silently serving published content in a preview
  if (draft && !token) {
    throw new Error("A read token is required to fetch draft content");
  }

  return createClient({
    projectId,
    dataset,
    useCdn: false,
    apiVersion: "2025-02-06",
    perspective: draft ? "drafts" : "published",
    token: draft ? token : undefined,
  });
}
