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

export type VenuePin = {
  /** the slug, pairs a list link with its dot on the map */
  id: string;
  title: string;
  url: string;
  detail: string;
  /** percent of the map frame */
  position: { x: number; y: number };
};

export type Homepage = {
  logo: CmsImage;
  cover: CmsImage;
  badgeLabel: string;
  heading: string;
  venues: VenuePin[];
  venuesCta: { label: string; url: string } | undefined;
  components: PageComponent[];
};

export type CoverBackground =
  | { kind: "image"; media: CmsImage }
  | { kind: "brand" }
  | { kind: "vivid" };

export type CoverAside =
  | { kind: "none" }
  // the game's own mark, not the venue logo the header carries
  | { kind: "logo"; logo: CmsImage }
  | { kind: "columns"; images: CmsImage[] };

export type PageCover = {
  background: CoverBackground;
  aside: CoverAside;
  badge: string | undefined;
  heading: string;
  subHeading: string | undefined;
  cta:
    | {
        label: string;
        url: string;
      }
    | undefined;
  secondaryCta:
    | {
        label: string;
        url: string;
      }
    | undefined;
};

export type VenuePageType = "home" | "gift" | "book";

export type JoinTheNetworkPage = {
  pageCover: PageCover;
  components: PageComponent[];
};

export type LegalNoticePage = {
  pageCover: PageCover;
  body: RichText;
};

export type TermsArticle = {
  /** @example "Objet", "Prix des services" — numbered by position, not authored */
  title: string;
  body: RichText;
};

export type VenueTerms = {
  slug: string;
  title: string;
  articles: TermsArticle[];
};

export type TermsAndConditionsPage = {
  pageCover: PageCover;
  intro: RichText;
  venues: VenueTerms[];
};

export type WhereToFindUsPage = {
  pageCover: PageCover;
  componentsBeforeMap: PageComponent[];
  venues: VenuePin[];
  venuesCta: { label: string; url: string } | undefined;
  componentsAfterMap: PageComponent[];
};

export type TeamMember = {
  photo: CmsImage;
  name: string;
  /** @example "C.E.O" */
  role: string;
  jobTitle: string;
  tone: "blue" | "red";
  mailLabel: string;
  mailHref: string;
};

export type VenueContact = {
  title: string;
  logo: CmsImage;
  address: string;
  mailLabel: string;
  mailHref: string;
  phoneLabel: string;
  phoneHref: string;
};

export type ContactPage = {
  pageCover: PageCover;
  team: {
    title: string;
    intro: string | undefined;
    members: TeamMember[];
  };
  venues: {
    title: string;
    intro: string | undefined;
    items: VenueContact[];
  };
};

export type VenuePage = {
  pageCover: PageCover;
  components: PageComponent[];
};

export type VenueWidgetPageType = "gift" | "book";

export type VenueWidgetPage = {
  pageCover: PageCover;
  componentsBeforeWidget: PageComponent[];
  componentsAfterWidget: PageComponent[];
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
