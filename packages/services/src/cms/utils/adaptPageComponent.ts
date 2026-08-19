import type { SanityPageComponent } from "@repo/api/sanity/shared/pageComponents";

import type { PageComponent } from "../pageComponent.types";
import { toCard } from "./toCard";
import { toCta } from "./toCta";

export function adaptPageComponent(data: SanityPageComponent): PageComponent {
  switch (data._type) {
    case "rollingBanner": {
      return {
        type: data._type,
        message: data.message,
        color: data.color,
      };
    }

    case "cardsGrid": {
      return {
        type: data._type,
        heading: data.heading,
        body: data.body,
        align: data.align,
        background: data.background,
        cta: toCta(data.cta),
        cards: data.cards.map((card) => toCard(card)),
      };
    }
  }
}
