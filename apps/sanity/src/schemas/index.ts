import { ctaType } from "./shared/cta";
import { imageWithAltType } from "./shared/imageWithAltType";
import { pageComponentsType } from "./shared/pageComponents";
import { cardsGridType, cardType } from "./shared/pageComponents/cardsGrid";
import { carouselType } from "./shared/pageComponents/carousel";
import { pageCoverType } from "./shared/pageCover";
import { gameFormatType } from "./gameFormat";
import { homepageType } from "./homepage";
import { siteSettingsType } from "./siteSettings";
import { venueType } from "./venue";
import { venueGameType } from "./venueGame";
import { venuePageType } from "./venuePage";
import { rollingBannerType } from "./shared/pageComponents/rollingBanner";
import { reviewsType } from "./shared/pageComponents/reviews";

export const schemaTypes = [
  homepageType,
  venueType,
  venuePageType,
  venueGameType,
  siteSettingsType,
  gameFormatType,
  imageWithAltType,
  pageComponentsType,
  pageCoverType,
  ctaType,
  rollingBannerType,
  cardsGridType,
  cardType,
  carouselType,
  reviewsType
];
