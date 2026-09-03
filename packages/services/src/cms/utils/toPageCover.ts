import type { SanityPageCover } from "@repo/api/sanity/shared/pageCover";

import type { CoverAside, CoverBackground, PageCover } from "../types";
import { toCmsImage } from "./toCmsImage";

function toBackground(data: SanityPageCover): CoverBackground {
  if (data.background !== "image") {
    return { kind: data.background };
  }

  if (!data.media) {
    throw new Error("page cover: an image background needs a media");
  }

  return { kind: "image", media: toCmsImage(data.media) };
}

function toAside(data: SanityPageCover): CoverAside {
  switch (data.aside) {
    case "none": {
      return { kind: "none" };
    }
    case "logo": {
      if (!data.logo) {
        throw new Error("page cover: a logo aside needs a logo");
      }

      return { kind: "logo", logo: toCmsImage(data.logo) };
    }
    case "columns": {
      if (!data.images) {
        throw new Error("page cover: a columns aside needs images");
      }

      return {
        kind: "columns",
        images: data.images.map((image) => toCmsImage(image)),
      };
    }
  }
}

export function toPageCover({ data }: { data: SanityPageCover }): PageCover {
  const { heading, subHeading, badge, cta, secondaryCta } = data;

  return {
    background: toBackground(data),
    aside: toAside(data),
    heading,
    subHeading: subHeading ?? undefined,
    badge: badge ?? undefined,
    cta: cta ?? undefined,
    secondaryCta: secondaryCta ?? undefined,
  };
}
