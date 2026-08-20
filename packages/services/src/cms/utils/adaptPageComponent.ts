import type { SanityPageComponent } from "@repo/api/sanity/shared/pageComponents";

import type { PageComponent } from "../pageComponent.types";
import { toCard } from "./toCard";
import { toCmsImage } from "./toCmsImage";
import { toCta } from "./toCta";

export function adaptPageComponent(data: SanityPageComponent): PageComponent {
  switch (data._type) {
    case "rollingBanner": {
      return {
        type: "rollingBanner",
        message: data.message,
        color: data.color,
      };
    }

    case "cardsGrid": {
      return {
        type: "cardsGrid",
        heading: data.heading,
        body: data.body,
        align: data.align,
        background: data.background,
        cta: toCta(data.cta),
        cards: data.cards.map((card) => toCard(card)),
      };
    }

    case "carousel": {
      return {
        type: "carousel",
        badge: data.badge ?? undefined,
        title: data.title,
        body: data.body,
        cta: toCta(data.cta),
        ctaTone: data.ctaTone,
        images: data.images.map((image) => toCmsImage(image)),
      };
    }

    case "reviews": {
      return {
        type: "reviews",
        surface: data.surface,
      };
    }

    case "prices": {
      return {
        type: "prices",
        title: data.title,
        surface: data.surface,
      };
    }
  }
}
