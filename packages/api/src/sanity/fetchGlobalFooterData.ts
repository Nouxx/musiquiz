import type { SanityClient } from "@sanity/client";
import { defineQuery } from "groq";

import { SanitySiteSettingsSchema } from "./schema";

function fetchGlobalFooterDataQuery() {
  return defineQuery(`*[_type == "siteSettings"][0]{
  headerLogo,
  footerLogo,
  facebookUrl,
  instagramUrl,
  linkedinUrl,
  tiktokUrl,
  youtubeUrl,
  mainPhone,
  mainEmail,
}`);
}

export async function fetchSiteSettingsData({
  sanityClient,
}: {
  sanityClient: SanityClient;
}) {
  const data = await sanityClient.fetch(fetchSiteSettingsQuery());

  if (!data) throw new Error("No site settings data");

  return SanitySiteSettingsSchema.parse(data);
}
