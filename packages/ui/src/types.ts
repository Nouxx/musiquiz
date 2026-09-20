import type { IconName } from "./lib/icons";
import type { MarkName } from "./lib/marks";

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

export type TeamMember = {
  photo: ImageSource;
  name: string;
  /** @example "C.E.O" */
  role: string;
  jobTitle: string;
  tone: Tone;
  mailLabel: string;
  mailHref: string;
};

export type VenueContact = {
  name: string;
  /** the badge, the venue title alone */
  city: string;
  logo: ImageSource;
  address: string;
  mailLabel: string;
  mailHref: string;
  phoneLabel: string;
  phoneHref: string;
};

export type Review = {
  name: string;
  body: string;
  score: number;
  avatar?: ImageSource;
};

export type CardItem = {
  media: ImageSource;
  badge?: string;
  title?: string;
  body?: string;
  cta?: CtaLink;
};

export type TextCard = {
  icon: IconName;
  body: string;
  media: ImageSource;
};

export type KeywordCard = {
  badge: string;
  icon: IconName;
  body: string;
};

export type DeckCard = {
  media: ImageSource;
  title: string;
  body: RichTextNode[];
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
  href?: string;
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

export type DetailCard = {
  mark?: MarkName;
  title: string;
  intro?: string;
  highlight: string;
};

export type DetailGroup = {
  name: string;
  cards: DetailCard[];
};

export type FaqQuestion = {
  question: string;
  answer: RichTextNode[];
};

export type Tone = "blue" | "red";

export type OfferPrice = {
  /** @example "28€", "Sur devis" */
  amount: string;
  /** carries its own separator @example " HT/joueur", "/enfant" */
  label?: string;
};

export type OfferCardContent =
  | { kind: "list"; intro?: string; items: string[] }
  | { kind: "text"; body: RichTextNode[] };

export type OfferCard = {
  icon: IconName;
  title: string;
  subTitle?: string;
  price: OfferPrice;
  content: OfferCardContent;
};

export type OfferGroup = {
  title: string;
  body: RichTextNode[];
  tone?: Tone;
  cards: OfferCard[];
};

export type VenuePin = {
  /** pairs the list link with its dot; the venue slug */
  id: string;
  title: string;
  /** @example "75", "BE" */
  detail: string;
  url: string;
  /** percent of the map frame */
  position: { x: number; y: number };
};

export type VenueOpeningOption = {
  value: string;
  label: string;
};

export type VenueOpeningTextField = {
  label: string;
  placeholder?: string;
};

export type VenueOpeningChoiceField = {
  label: string;
  options: VenueOpeningOption[];
};

export type VenueOpeningSelectField = VenueOpeningChoiceField & {
  placeholder: string;
};

export type VenueOpeningStep = {
  title: string;
  description: string;
};

export type VenueOpeningCopy = {
  title: string;
  intro: string;
  progressLabel: string;
  steps: [
    VenueOpeningStep,
    VenueOpeningStep,
    VenueOpeningStep,
    VenueOpeningStep,
  ];
  fields: {
    profile: VenueOpeningChoiceField;
    intent: VenueOpeningChoiceField;
    city: VenueOpeningTextField;
    population: VenueOpeningSelectField;
    premises: VenueOpeningChoiceField;
    horizon: VenueOpeningSelectField;
    contribution: VenueOpeningSelectField;
    experience: VenueOpeningChoiceField;
    partners: VenueOpeningChoiceField;
    firstName: VenueOpeningTextField;
    lastName: VenueOpeningTextField;
    mail: VenueOpeningTextField;
    phone: VenueOpeningTextField;
    source: VenueOpeningSelectField;
    message: VenueOpeningTextField;
    rgpd: { label: string; consent: string };
  };
  previous: string;
  next: string;
  submit: string;
  pending: string;
  success: string;
  failure: string;
};

export type VenueOpeningLimits = {
  city: number;
  firstName: number;
  lastName: number;
  mail: number;
  phone: number;
  message: number;
};

// todo: move this to a better place
export const venuesMapAnchorId = "venuesMap";
