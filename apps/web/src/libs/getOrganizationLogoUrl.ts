import type { CmsImage } from "@repo/services/cms/types";
import { getImage } from "astro:assets";

export async function getOrganizationLogoUrl(site: URL, logo: CmsImage) {
  const image = await getImage({
    src: logo.url,
    width: logo.width,
    height: logo.height,
    ...(logo.mimeType === "image/svg+xml" && { format: "svg" }),
  });

  return new URL(image.src, site).href;
}
