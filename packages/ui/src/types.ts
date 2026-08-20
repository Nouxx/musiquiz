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
