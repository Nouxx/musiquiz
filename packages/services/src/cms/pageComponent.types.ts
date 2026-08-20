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

type Prices = {
  type: "prices";
  title: string;
  surface: "default" | "muted";
};

export type PageComponent =
  | RollingBanner
  | CardsGrid
  | Carousel
  | Reviews
  | Prices;
