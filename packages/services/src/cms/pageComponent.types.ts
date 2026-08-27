import type { CmsImage, RichText } from "./types";

type RollingBanner = {
  type: "rollingBanner";
  message: string;
  color: "red" | "blue";
};

export type Cta = {
  label: string;
  url: string; // todo: see how we can improve authoring experience (here the url is not checked) -> ideally in sanity studio
};

export type Card = {
  media: CmsImage;
  badge: string;
  title: string;
  body: string | undefined;
  cta: Cta | undefined;
};

type CardsGrid = {
  type: "cardsGrid";
  heading: string;
  body: string;
  align: "left" | "center";
  background: "vivid" | "muted";
  cta: Cta | undefined;
  cards: Card[];
};

type Carousel = {
  type: "carousel";
  badge: string | undefined;
  title: string;
  body: string;
  cta: Cta | undefined;
  ctaTone: "red" | "blue";
  images: CmsImage[];
};

type Reviews = {
  type: "reviews";
  surface: "default" | "muted";
};

export type GamePrice = {
  playerCountFrom: number | undefined;
  playerCountTo: number | undefined;
  amount: number;
  note: string | undefined;
};

export type PricesGame = {
  name: string;
  image: CmsImage;
  prices: GamePrice[];
};

export type PricesFootnote = {
  title: string;
  body: string;
};

type VenuePrices = {
  type: "venuePrices";
  title: string;
  surface: "default" | "muted";
  cta: Cta | undefined;
  footnote: PricesFootnote | undefined;
  venueSlug: string;
  games: PricesGame[];
};

type GamePrices = {
  type: "gamePrices";
  title: string;
  surface: "default" | "muted";
  cta: Cta | undefined;
  footnote: PricesFootnote | undefined;
  venueSlug: string;
  game: PricesGame;
};

type FindUs = {
  type: "findUs";
  badge: string;
  title: string;
  media: CmsImage;
  venueTitle: string;
  location: { lat: number; lng: number };
  address: string;
  mapsUrl: string;
  addressNote: string;
  openingTitle: string;
  openingNote: string;
  contactTitle: string;
  contactNote: string;
};

type ClientContactForm = {
  type: "clientContactForm";
  images: CmsImage[];
};

type Logos = {
  type: "logos";
  layout: "inline" | "stacked";
  surface: "default" | "muted";
  badge: string;
  title: string;
  logos: CmsImage[];
};

export type FaqQuestion = {
  question: string;
  answer: RichText;
};

export type TextBlock = {
  badge: string | undefined;
  title: string;
  body: RichText;
  additionalCtas: Cta[];
  cta: Cta | undefined;
  ctaTone: "red" | "blue";
};

export type DeckCard = {
  media: CmsImage;
  title: string;
  body: RichText;
};

type CardsScroller = {
  type: "cardsScroller";
  textBlock: TextBlock;
  cards: DeckCard[];
};

type Faq = {
  type: "faq";
  title: string;
  questions: FaqQuestion[];
  images: CmsImage[];
};

type DetailMark = "50-50" | "mute" | "theft" | "x2";

export type DetailCard = {
  mark: DetailMark | undefined;
  title: string;
  intro: string | undefined;
  highlight: string;
};

export type DetailGroup = {
  name: string;
  cards: DetailCard[];
};

type DetailTabs = {
  type: "detailTabs";
  title: string;
  groups: DetailGroup[];
  images: CmsImage[];
};

type TextSlideshow = {
  type: "textSlideshow";
  textBlock: TextBlock;
  surface: "default" | "muted";
  images: CmsImage[];
};

type VideoEmbed = {
  type: "videoEmbed";
  videoId: string;
  title: string;
  surface: "default" | "muted" | "vivid";
};

export type PageComponent =
  | RollingBanner
  | CardsGrid
  | Carousel
  | Reviews
  | VenuePrices
  | GamePrices
  | FindUs
  | ClientContactForm
  | Logos
  | Faq
  | CardsScroller
  | DetailTabs
  | TextSlideshow
  | VideoEmbed;
