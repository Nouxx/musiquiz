import type { SanityPageComponent } from "@repo/api/sanity/shared/pageComponents";
import { getMailto } from "@repo/utils/getMailto";
import { getTel } from "@repo/utils/getTel";

import type { PageComponent } from "../pageComponent.types";
import { toCard } from "./toCard";
import { toCmsImage } from "./toCmsImage";
import { toCta } from "./toCta";
import { toDeckCard } from "./toDeckCard";
import { toDetailGroup } from "./toDetailGroup";
import { toKeywordCard } from "./toKeywordCard";
import { toOfferCard } from "./toOfferCard";
import { toOfferGroup } from "./toOfferGroup";
import { toPricesGame } from "./toPricesGame";
import { toRichText } from "./toRichText";
import { toTextBlock } from "./toTextBlock";
import { toTextCard } from "./toTextCard";

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

    case "contactPanels": {
      return {
        type: "contactPanels",
        media: toCmsImage(data.media),
        venueSlug: data.venueSlug,
        venueTitle: data.venueTitle,
        quote: {
          label: data.quoteLabel,
          title: data.quoteTitle,
          body: data.quoteBody,
        },
        booking: {
          label: data.bookingLabel,
          title: data.bookingTitle,
          body: data.bookingBody,
        },
        quoteCta: toCta(data.quoteCta),
        phoneLabel: data.phone,
        phoneHref: getTel(data.phone),
        mailLabel: data.mail,
        mailHref: getMailto(data.mail),
      };
    }

    case "clientContactForm": {
      return {
        type: "clientContactForm",
        images: data.images.map((image) => toCmsImage(image)),
      };
    }

    case "eventQuotationForm": {
      return {
        type: "eventQuotationForm",
        services: data.services.map((service) => service.label),
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
        cards: data.cards.map((card) => toDeckCard(card)),
      };
    }

    case "textSlideshow": {
      return {
        type: "textSlideshow",
        textBlock: toTextBlock(data.textBlock),
        surface: data.surface,
        slideshowPosition: data.slideshowPosition,
        images: data.images.map((image) => toCmsImage(image)),
      };
    }

    case "textCards": {
      return {
        type: "textCards",
        textBlock: toTextBlock(data.textBlock),
        cards: data.cards.map((card) => toTextCard(card)),
      };
    }

    case "textCardsGrid": {
      return {
        type: "textCardsGrid",
        heading: data.heading,
        body: data.body,
        cta: toCta(data.cta),
        cards: data.cards.map((card) => toKeywordCard(card)),
      };
    }

    case "offers": {
      return {
        type: "offers",
        title: data.title,
        subTitle: data.subTitle ?? undefined,
        background: data.background,
        venueSlug: data.venueSlug,
        cta: toCta(data.cta),
        content:
          data.content.layout === "groups"
            ? {
                layout: "groups",
                groups: [
                  toOfferGroup(data.content.groups[0]),
                  toOfferGroup(data.content.groups[1]),
                ],
              }
            : {
                layout: "cards",
                cards: data.content.cards.map((card) => toOfferCard(card)),
              },
      };
    }

    case "videoEmbed": {
      return {
        type: "videoEmbed",
        videoId: data.videoId,
        title: data.title,
        surface: data.surface,
      };
    }

    case "detailTabs": {
      return {
        type: "detailTabs",
        title: data.title,
        groups: data.groups.map((group) => toDetailGroup(group)),
        images: data.images.map((image) => toCmsImage(image)),
      };
    }

    case "gamePrices": {
      return {
        type: "gamePrices",
        title: data.title,
        surface: data.surface,
        cta: toCta(data.cta),
        footnote: data.footnote ?? undefined,
        venueSlug: data.venueSlug,
        game: toPricesGame(data.game),
      };
    }
  }
}
