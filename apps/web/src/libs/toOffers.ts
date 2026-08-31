import type {
  OfferCard,
  OfferGroup,
  OfferPrice,
  PageComponent,
} from "@repo/services/cms/pageComponent.types";
import { getRoutesForLang } from "@repo/services/routing/getRoutesForLang";
import type {
  OfferCard as UiOfferCard,
  OfferGroup as UiOfferGroup,
  OfferPrice as UiOfferPrice,
} from "@repo/ui/types";
import { formatEuros } from "@repo/utils/formatEuros";
import type { Lang } from "@repo/utils/lang";

import type { getT } from "./i18n";

type Translate = ReturnType<typeof getT>;

type Offers = Extract<PageComponent, { type: "offers" }>;

// "28€ HT/joueur", but "36€/enfant"
function withSeparator(label: string) {
  return label.startsWith("/") ? label : ` ${label}`;
}

function toPrice({
  price,
  t,
  lang,
}: {
  price: OfferPrice;
  t: Translate;
  lang: Lang;
}): UiOfferPrice {
  if (price.quotation) return { amount: t("offers.quotation") };

  return {
    amount: formatEuros(price.amount, lang),
    label: price.label && withSeparator(price.label),
  };
}

function toCard({
  card,
  t,
  lang,
}: {
  card: OfferCard;
  t: Translate;
  lang: Lang;
}): UiOfferCard {
  return {
    icon: card.icon,
    title: card.title,
    subTitle: card.subTitle,
    price: toPrice({ price: card.price, t, lang }),
    content: card.content,
  };
}

function toGroup({
  group,
  t,
  lang,
}: {
  group: OfferGroup;
  t: Translate;
  lang: Lang;
}): UiOfferGroup {
  return {
    title: group.title,
    body: group.body,
    tone: group.tone,
    cards: group.cards.map((card) => toCard({ card, t, lang })),
  };
}

export function toOffers({
  component,
  t,
  lang,
}: {
  component: Offers;
  t: Translate;
  lang: Lang;
}) {
  const common = {
    title: component.title,
    subTitle: component.subTitle,
    background: component.background,
    cta: component.cta,
    bookCta: {
      label: t("offers.book"),
      url: getRoutesForLang(lang).venueBook(component.venueSlug),
    },
  };

  if (component.content.layout === "cards") {
    return {
      ...common,
      cards: component.content.cards.map((card) => toCard({ card, t, lang })),
    };
  }

  const [first, second] = component.content.groups;

  const groups: [UiOfferGroup, UiOfferGroup] = [
    toGroup({ group: first, t, lang }),
    toGroup({ group: second, t, lang }),
  ];

  return { ...common, groups };
}
