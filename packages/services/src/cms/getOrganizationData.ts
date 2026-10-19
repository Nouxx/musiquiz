import {
  fetchOrganization,
  type SanityOrganization,
} from "@repo/api/sanity/organization";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { Organization } from "./types";
import { toCmsImage } from "./utils/toCmsImage";

function adaptOrganization(data: SanityOrganization): Organization {
  return {
    logo: toCmsImage(data.footerLogo),
    // we are not including the venue's socials this they are not the "brand" ones
    sameAs: [
      data.facebookUrl,
      data.instagramUrl,
      data.linkedinUrl,
      data.tiktokUrl,
      data.youtubeUrl,
    ],
    telephone: data.mainPhone,
    email: data.mainEmail,
    venues: data.venues.map((venue) => ({
      slug: venue.slug,
      city: venue.title,
    })),
  };
}

// every page renders it; one fetch per build, not one per page
const cache = new Map<string, Promise<Organization>>();

async function fetchOrganizationData(config: SanityConfig) {
  try {
    return adaptOrganization(await fetchOrganization({ config }));
  } catch (error) {
    // a long-lived ssr isolate would otherwise replay one failure forever
    cache.delete(config.dataset);
    throw error;
  }
}

export async function getOrganizationData({
  config,
}: {
  config: SanityConfig;
}) {
  const cached = cache.get(config.dataset);
  if (cached) return cached;

  const organization = fetchOrganizationData(config);
  cache.set(config.dataset, organization);
  return organization;
}
