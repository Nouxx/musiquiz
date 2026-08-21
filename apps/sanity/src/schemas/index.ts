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
import { priceType, venueGameType } from "./venueGame";
import { venuePageType } from "./venuePage";
import { rollingBannerType } from "./shared/pageComponents/rollingBanner";
import { reviewsType } from "./shared/pageComponents/reviews";
import { venuePricesType } from "./shared/pageComponents/venuePrices";
import { gamePricesType } from "./shared/pageComponents/gamePrices";
import { findUsType } from "./shared/pageComponents/findUs";
import { clientContactFormType } from "./shared/pageComponents/clientContactForm";

export const schemaTypes = [
  homepageType,
  venueType,
  venuePageType,
  venueGameType,
  priceType,
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
  reviewsType,
  venuePricesType,
  gamePricesType,
  findUsType,
  clientContactFormType,
];
