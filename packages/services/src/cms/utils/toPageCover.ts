import type { SanityPageCover } from "@repo/api/sanity/shared/pageCover";

import type { PageCover } from "../types";
import { toCmsImage } from "./toCmsImage";

export function toPageCover({
  data,
  ctaUrl,
  ctaIcon = "arrow-right",
}: {
  data: SanityPageCover;
  ctaUrl: string;
  ctaIcon?: PageCover["cta"]["icon"];
}): PageCover {
  const { media, logo, heading, subHeading, badge, ctaLabel } = data;

  return {
    media: toCmsImage(media),
    logo: logo ? toCmsImage(logo) : undefined,
    heading,
    subHeading: subHeading ?? undefined,
    badge: badge ?? undefined,
    cta: {
      label: ctaLabel,
      url: ctaUrl,
      icon: ctaIcon,
    },
  };
}
