import type { Lang } from "@repo/utils/lang";

export type Venue = {
  title: string;
  slug: string;
};

export type Homepage = {
  logo: string;
  badgeLabel: string;
  heading: string;
  venues: Venue[];
};

export type Header = {
  logo: string;
};

export type GameFormatLinks = {
  label: string;
  url: string;
};

export type Footer = {
  logo: string;
  socials: {
    tiktokUrl?: string;
    youtubeUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    linkedinUrl?: string;
  };
  contact: {
    mail: string;
    phone: string;
  };
  gamesFormatsLinks: GameFormatLinks[];
  newsletter: boolean;
  languageLink: {
    label: string;
    url: string;
    lang: Lang;
  };
};
