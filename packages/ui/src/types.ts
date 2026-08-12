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
