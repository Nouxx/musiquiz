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

export type VenueHomepage = {
  pageCover: {
    media: string;
    badge: string | undefined;
    heading: string;
    subHeading: string;
    ctaLabel: string;
  };
};

export type Header = {
  logo: string;
  experiences: {
    label: string;
    slug: string;
  }[];
};

export type GameFormatLinks = {
  label: string;
  slug: string;
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
  venuesLink: { label: string; slug: string }[];
  paymentMethods: { image: string; alt: string }[];
};

export type VenueFooter = {
  logo: string;
  socials: {
    tiktokUrl?: string;
    youtubeUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    linkedinUrl?: string;
  };
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
    mail: string;
    phone: string;
    mapsLink?: string;
  };
  games: GameFormatLinks[];
  otherVenuesCount: number;
  otherVenues: {
    title: string;
    slug: string;
  }[];
  paymentMethods: { image: string; alt: string }[];
};
