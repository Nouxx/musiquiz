import type { SanityPageComponent } from "@repo/api/sanity/shared/pageComponents";
import { currencyOf } from "@repo/utils/currency";
import { getMailto } from "@repo/utils/getMailto";
import { getTel } from "@repo/utils/getTel";
import type { Lang } from "@repo/utils/lang";

import type { PageComponent } from "../pageComponent.types";
import { toAddressLine } from "./toAddressLine";
import { toCard } from "./toCard";
import { toCmsImage } from "./toCmsImage";
import { toCmsVideo } from "./toCmsVideo";
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
import { toBookingLink } from "./toVenueLinks";

export function adaptPageComponent({
  data,
  lang,
}: {
  data: SanityPageComponent;
  lang: Lang;
}): PageComponent {
  switch (data._type) {
    case "rollingBanner": {
      return {
        type: "rollingBanner",
        anchor: data.anchor ?? undefined,
        message: data.message,
        color: data.color,
      };
    }

    case "cardsGrid": {
      return {
        type: "cardsGrid",
        anchor: data.anchor ?? undefined,
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
        anchor: data.anchor ?? undefined,
        badge: data.badge ?? undefined,
        title: data.title,
        body: data.body,
        cta: toCta(data.cta),
        ctaTone: data.ctaTone,
        slides: data.slides.map((slide) =>
          slide.kind === "video"
            ? {
                kind: "video",
                ...toCmsVideo(slide.video),
                link: slide.link ?? undefined,
              }
            : { kind: "image", image: toCmsImage(slide.image) },
        ),
      };
    }

    case "reviews": {
      return {
        type: "reviews",
        anchor: data.anchor ?? undefined,
        widgetId: data.widgetId,
        badge: data.badge,
        title: data.title,
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
        bookingLink: toBookingLink({ venue: data.venue, lang }),
        games: data.games.map((game) =>
          toPricesGame({ game, currency: currencyOf(data.addressCountry) }),
        ),
      };
    }

    case "findUs": {
      return {
        type: "findUs",
        anchor: data.anchor ?? undefined,
        badge: data.badge,
        title: data.title,
        media: toCmsImage(data.media),
        venueTitle: data.venueTitle,
        location: data.location,
        address: toAddressLine(data.address),
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
        anchor: data.anchor ?? undefined,
        media: toCmsImage(data.media),
        bookingLink: toBookingLink({ venue: data.venue, lang }),
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
        anchor: data.anchor ?? undefined,
        images: data.images.map((image) => toCmsImage(image)),
        venueSlug: data.venueSlug,
      };
    }

    case "quotationForm": {
      return {
        type: "quotationForm",
        anchor: data.anchor ?? undefined,
        audience: data.audience,
        services: data.services.map((service) => service.label),
        venueSlug: data.venueSlug,
      };
    }

    case "logos": {
      return {
        type: "logos",
        anchor: data.anchor ?? undefined,
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
        anchor: data.anchor ?? undefined,
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
        anchor: data.anchor ?? undefined,
        textBlock: toTextBlock(data.textBlock),
        cards: data.cards.map((card) => toDeckCard(card)),
      };
    }

    case "textSlideshow": {
      return {
        type: "textSlideshow",
        anchor: data.anchor ?? undefined,
        textBlock: toTextBlock(data.textBlock),
        surface: data.surface,
        slideshowPosition: data.slideshowPosition,
        images: data.images.map((image) => toCmsImage(image)),
      };
    }

    case "textStrip": {
      return {
        type: "textStrip",
        anchor: data.anchor ?? undefined,
        textBlock: toTextBlock(data.textBlock),
        images: data.images.map((image) => toCmsImage(image)),
      };
    }

    case "textBody": {
      return {
        type: "textBody",
        anchor: data.anchor ?? undefined,
        body: toRichText(data.body),
      };
    }

    case "textCards": {
      return {
        type: "textCards",
        anchor: data.anchor ?? undefined,
        textBlock: toTextBlock(data.textBlock),
        cards: data.cards.map((card) => toTextCard(card)),
      };
    }

    case "textCardsGrid": {
      return {
        type: "textCardsGrid",
        anchor: data.anchor ?? undefined,
        heading: data.heading,
        body: data.body,
        cta: toCta(data.cta),
        cards: data.cards.map((card) => toKeywordCard(card)),
      };
    }

    case "offers": {
      const currency = currencyOf(data.addressCountry);

      return {
        type: "offers",
        anchor: data.anchor ?? undefined,
        title: data.title,
        subTitle: data.subTitle ?? undefined,
        background: data.background,
        bookingLink: toBookingLink({ venue: data.venue, lang }),
        cta: toCta(data.cta),
        content:
          data.content.layout === "groups"
            ? {
                layout: "groups",
                groups: [
                  toOfferGroup({ group: data.content.groups[0], currency }),
                  toOfferGroup({ group: data.content.groups[1], currency }),
                ],
              }
            : {
                layout: "cards",
                cards: data.content.cards.map((card) =>
                  toOfferCard({ card, currency }),
                ),
              },
      };
    }

    case "videoEmbed": {
      return {
        type: "videoEmbed",
        anchor: data.anchor ?? undefined,
        videoId: data.videoId,
        title: data.title,
        surface: data.surface,
      };
    }

    case "detailTabs": {
      return {
        type: "detailTabs",
        anchor: data.anchor ?? undefined,
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
        bookingLink: toBookingLink({ venue: data.venue, lang }),
        game: toPricesGame({
          game: data.game,
          currency: currencyOf(data.addressCountry),
        }),
      };
    }
  }
}
