import type { CmsImage } from "@repo/services/cms/types";
import { getImage } from "astro:assets";

// the size Facebook, LinkedIn and WhatsApp crop to
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

export async function getOgImage(site: URL, image: CmsImage) {
  const og = await getImage({
    src: image.url,
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fit: "cover",
    format: "jpeg",
  });

  return {
    url: new URL(og.src, site).href,
    width: OG_WIDTH,
    height: OG_HEIGHT,
  };
}
