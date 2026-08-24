import type { IconName } from "./lib/icons";

export type SpaceScale =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "8"
  | "10"
  | "12"
  | "16"
  | "20"
  | "24";

export type NavLink = {
  label: string;
  url: string;
  current?: boolean;
};

export type NavMenu = {
  label: string;
  links: NavLink[];
  current?: boolean;
};

export type ImageSource = {
  url: string;
  width: number;
  height: number;
  mimeType: string;
  alt: string;
};

export type CtaLink = {
  label: string;
  url: string;
};

export type Review = {
  name: string;
  body: string;
  score: number;
  avatar?: ImageSource;
};

export type CardItem = {
  media: ImageSource;
  badge: string;
  title: string;
  body?: string;
  cta?: CtaLink;
};

export type PriceTier = {
  /** @example "De 4 à 6 joueurs", "Tarif unique" */
  label: string;
  icon: IconName;
  /** @example "16€" */
  amountWithCurrency: string;
  note?: string;
};

export type PriceOffer = {
  name: string;
  image: ImageSource;
  tiers: PriceTier[];
};

export type ContactFact = {
  icon: IconName;
  label: string;
  title: string;
  body?: string;
};

export type RichTextSpan = {
  text: string;
  bold?: boolean;
  /** turns the span into a link */
  href?: string;
};

export type RichTextNode = {
  type: "paragraph";
  spans: RichTextSpan[];
};

export type FaqQuestion = {
  question: string;
  answer: RichTextNode[];
};
