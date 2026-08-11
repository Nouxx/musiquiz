import type { SanityConfig } from "@repo/utils/sanityConfig";
import {
  PREVIEW,
  SANITY_API_READ_TOKEN,
  SANITY_STUDIO_DATASET,
  SANITY_STUDIO_PROJECT_ID,
} from "astro:env/server";

export function getSanityConfigFromEnvironment(): SanityConfig {
  return {
    projectId: SANITY_STUDIO_PROJECT_ID,
    dataset: SANITY_STUDIO_DATASET,
    draft: PREVIEW,
    token: SANITY_API_READ_TOKEN,
  };
}
