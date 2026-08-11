import { imageWithAltType } from "./shared/imageWithAltType";
import { pageComponentsType } from "./shared/pageComponents";
import { gameFormatType } from "./gameFormat";
import { homepageType } from "./homepage";
import { siteSettingsType } from "./siteSettings";
import { venueType } from "./venue";
import {
  dummyType,
  rollingBannerType,
} from "./shared/pageComponents/rollingBanner";

export const schemaTypes = [
  homepageType,
  venueType,
  siteSettingsType,
  gameFormatType,
  imageWithAltType,
  pageComponentsType,
  rollingBannerType,
  dummyType,
];
