import { ctaType } from "./shared/cta";
import { imageWithAltType } from "./shared/imageWithAltType";
import { pageComponentsType } from "./shared/pageComponents";
import { cardsGridType, cardType } from "./shared/pageComponents/cardsGrid";
import { carouselType } from "./shared/pageComponents/carousel";
import { pageCoverType } from "./shared/pageCover";
import { pricesFootnoteType } from "./shared/pricesFootnote";
import { eventFormatType } from "./eventFormat";
import { gameFormatType } from "./gameFormat";
import { homepageType } from "./homepage";
import { siteSettingsType } from "./siteSettings";
import { venueType } from "./venue";
import { priceType, venueGameType } from "./venueGame";
import { venueEventType } from "./venueEvent";
import { venuePageType } from "./venuePage";
import { rollingBannerType } from "./shared/pageComponents/rollingBanner";
import { reviewsType } from "./shared/pageComponents/reviews";
import { venuePricesType } from "./shared/pageComponents/venuePrices";
import { gamePricesType } from "./shared/pageComponents/gamePrices";
import { findUsType } from "./shared/pageComponents/findUs";
import { contactPanelsType } from "./shared/pageComponents/contactPanels";
import { clientContactFormType } from "./shared/pageComponents/clientContactForm";
import { logosType } from "./shared/pageComponents/logos";
import { faqQuestionType, faqType } from "./shared/pageComponents/faq";
import {
  cardsScrollerType,
  deckCardType,
} from "./shared/pageComponents/cardsScroller";
import {
  detailCardType,
  detailGroupType,
  detailTabsType,
} from "./shared/pageComponents/detailTabs";
import { textCardsType, textCardType } from "./shared/pageComponents/textCards";
import {
  keywordCardType,
  textCardsGridType,
} from "./shared/pageComponents/textCardsGrid";
import {
  offerCardType,
  offerGroupType,
  offerListItemType,
  offersType,
} from "./shared/pageComponents/offers";
import { textSlideshowType } from "./shared/pageComponents/textSlideshow";
import { videoEmbedType } from "./shared/pageComponents/videoEmbed";
import { textBlockType } from "./shared/textBlock";

export const schemaTypes = [
  homepageType,
  venueType,
  venuePageType,
  venueGameType,
  venueEventType,
  priceType,
  siteSettingsType,
  gameFormatType,
  eventFormatType,
  imageWithAltType,
  pageComponentsType,
  pageCoverType,
  ctaType,
  rollingBannerType,
  cardsGridType,
  cardType,
  carouselType,
  reviewsType,
  pricesFootnoteType,
  venuePricesType,
  gamePricesType,
  findUsType,
  contactPanelsType,
  clientContactFormType,
  logosType,
  faqType,
  faqQuestionType,
  cardsScrollerType,
  deckCardType,
  detailTabsType,
  detailGroupType,
  detailCardType,
  textCardsType,
  textCardType,
  textCardsGridType,
  keywordCardType,
  textSlideshowType,
  offersType,
  offerGroupType,
  offerCardType,
  offerListItemType,
  videoEmbedType,
  textBlockType,
];
