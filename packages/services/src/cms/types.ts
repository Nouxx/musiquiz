import type { PageComponent } from "./pageComponent.types";

export type CmsImage = {
  url: string;
  // `width` and `height` are the dimensions of the image the `url` points at,
  // not the size it will be rendered at.
  width: number;
  height: number;
  mimeType: string;
  alt: string;
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

export type RichText = RichTextNode[];

export type Homepage = {
  logo: CmsImage;
  cover: CmsImage;
  badgeLabel: string;
  heading: string;
  venues: {
    /** the slug, pairs a list link with its dot on the map */
    id: string;
    title: string;
    url: string;
    detail: string;
    /** percent of the map frame */
    position: { x: number; y: number };
  }[];
  venuesCta: { label: string; url: string } | undefined;
  components: PageComponent[];
};

export type PageCover = {
  media: CmsImage;
  // the game's own mark, not the venue logo the header carries
  logo: CmsImage | undefined;
  badge: string | undefined;
  heading: string;
  subHeading: string | undefined;
  cta: {
    label: string;
    url: string;
  };
};

export type VenuePageType = "home" | "gift" | "book";

export type VenuePage = {
  pageCover: PageCover;
  components: PageComponent[];
};

export type VenueGamePage = {
  gameName: string;
  pageCover: PageCover;
  components: PageComponent[];
};

export type VenueEventPage = {
  eventName: string;
  pageCover: PageCover;
  components: PageComponent[];
};

export type Header = {
  logo: CmsImage;
  venue: {
    logo: CmsImage;
    address: string;
    mapsLink: string;
    mailLabel: string;
    mailHref: string;
    phoneLabel: string;
    phoneHref: string;
  };
  experiences: {
    label: string;
    url: string;
  }[];
  events: {
    label: string;
    url: string;
  }[];
  socials: Socials;
};

export type GameFormatLinks = {
  label: string;
  url: string;
};

type Socials = {
  tiktokUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
};

export type Footer = {
  logo: CmsImage;
  socials: Socials;
  contact: {
    mailLabel: string;
    mailHref: string;
    phoneLabel: string;
    phoneHref: string;
  };
  gamesFormatsLinks: GameFormatLinks[];
  newsletter: boolean;
  paymentMethods: CmsImage[];
};

export type VenueFooter = {
  logo: CmsImage;
  socials: Socials;
  newsletter: boolean;
  venueTitle: string;
  openHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  contact: {
    mailLabel: string;
    mailHref: string;
    phoneLabel: string;
    phoneHref: string;
    mapsLink?: string;
  };
  games: GameFormatLinks[];
  paymentMethods: CmsImage[];
};
