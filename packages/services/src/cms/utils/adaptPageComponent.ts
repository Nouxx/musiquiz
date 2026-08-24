import type { SanityPageComponent } from "@repo/api/sanity/shared/pageComponents";

import type { PageComponent } from "../pageComponent.types";
import { toCard } from "./toCard";
import { toCmsImage } from "./toCmsImage";
import { toCta } from "./toCta";
import { toPricesGame } from "./toPricesGame";
import { toRichText } from "./toRichText";
import { toTextBlock } from "./toTextBlock";

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

    case "venuePrices": {
      return {
        type: "venuePrices",
        title: data.title,
        surface: data.surface,
        cta: toCta(data.cta),
        footnote: data.footnote ?? undefined,
        venueSlug: data.venueSlug,
        games: data.games.map((game) => toPricesGame(game)),
      };
    }

    case "findUs": {
      return {
        type: "findUs",
        badge: data.badge,
        title: data.title,
        media: toCmsImage(data.media),
        venueTitle: data.venueTitle,
        location: data.location,
        address: data.address,
        mapsUrl: data.mapsUrl,
        addressNote: data.addressNote,
        openingTitle: data.openingTitle,
        openingNote: data.openingNote,
        contactTitle: data.contactTitle,
        contactNote: data.contactNote,
      };
    }

    case "clientContactForm": {
      return {
        type: "clientContactForm",
        images: data.images.map((image) => toCmsImage(image)),
      };
    }

    case "logos": {
      return {
        type: "logos",
        layout: data.layout,
        surface: data.surface,
        badge: data.badge,
        title: data.title,
        logos: data.logos.map((logo) => toCmsImage(logo)),
      };
    }

    case "faq": {
      return {
        type: "faq",
        title: data.title,
        questions: data.questions.map((question) => ({
          question: question.question,
          answer: toRichText(question.answer),
        })),
        images: data.images.map((image) => toCmsImage(image)),
      };
    }

    case "cardsScroller": {
      return {
        type: "cardsScroller",
        textBlock: toTextBlock(data.textBlock),
      };
    }

    case "gamePrices": {
      return {
        type: "gamePrices",
        title: data.title,
        surface: data.surface,
        game: toPricesGame(data.game),
      };
    }
  }
}
