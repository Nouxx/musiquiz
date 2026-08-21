import type { CmsImage } from "./types";

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

type VenuePrices = {
  type: "venuePrices";
  title: string;
  surface: "default" | "muted";
  cta: Cta | undefined;
  footnote: { title: string; body: string } | undefined;
  venueSlug: string;
  games: PricesGame[];
};

type GamePrices = {
  type: "gamePrices";
  title: string;
  surface: "default" | "muted";
  game: PricesGame;
};

export type PageComponent =
  | RollingBanner
  | CardsGrid
  | Carousel
  | Reviews
  | VenuePrices
  | GamePrices;
