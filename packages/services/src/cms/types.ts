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
