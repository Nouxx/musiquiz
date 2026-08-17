import { imageWithAltType } from "./shared/imageWithAltType";
import { pageComponentsType } from "./shared/pageComponents";
import { pageCoverType } from "./shared/pageCover";
import { gameFormatType } from "./gameFormat";
import { homepageType } from "./homepage";
import { siteSettingsType } from "./siteSettings";
import { venueType } from "./venue";
import { venuePageType } from "./venuePage";
import {
  dummyType,
  rollingBannerType,
} from "./shared/pageComponents/rollingBanner";

export const schemaTypes = [
  homepageType,
  venueType,
  venuePageType,
  siteSettingsType,
  gameFormatType,
  imageWithAltType,
  pageComponentsType,
  pageCoverType,
  rollingBannerType,
  dummyType,
];
