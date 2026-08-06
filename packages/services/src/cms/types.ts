export type CmsImage = {
  url: string;
  // `width` and `height` are the dimensions of the image the `url` points at,
  // not the size it will be rendered at.
  width: number;
  height: number;
  mimeType: string;
  alt: string;
};

export type Venue = {
  title: string;
  slug: string;
};

export type Homepage = {
  logo: CmsImage;
  badgeLabel: string;
  heading: string;
  venues: Venue[];
};

export type VenueHomepage = {
  pageCover: {
    media: CmsImage;
    badge: string | undefined;
    heading: string;
    subHeading: string;
    ctaLabel: string;
  };
};

export type Header = {
  logo: CmsImage;
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
  logo: CmsImage;
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
  venuesLink: { label: string; slug: string }[];
  paymentMethods: CmsImage[];
};

export type VenueFooter = {
  logo: CmsImage;
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
  paymentMethods: CmsImage[];
};
