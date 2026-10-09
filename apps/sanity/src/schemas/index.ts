import { ctaType } from "./shared/cta";
import { imageWithAltType } from "./shared/imageWithAltType";
import { pageComponentsType } from "./shared/pageComponents";
import { cardsGridType, cardType } from "./shared/pageComponents/cardsGrid";
import { carouselType } from "./shared/pageComponents/carousel";
import { pageCoverType } from "./shared/pageCover";
import { pricesFootnoteType } from "./shared/pricesFootnote";
import { eventFormatType } from "./eventFormat";
import { gameFormatType } from "./gameFormat";
import { joinTheNetworkPageType } from "./joinTheNetworkPage";
import { contactPageType } from "./contactPage";
import { whereToFindUsPageType } from "./whereToFindUsPage";
import { globalBookingPageType } from "./globalBookingPage";
import { legalNoticePageType } from "./legalNoticePage";
import { termsAndConditionsPageType } from "./termsAndConditionsPage";
import { homepageType } from "./homepage";
import { blogPageType } from "./blogPage";
import { siteSettingsType } from "./siteSettings";
import { teamMemberType } from "./teamMember";
import { blogArticleType, blogFaqType } from "./blogArticle";
import { blogFindUsType, venueBlogType } from "./venueBlog";
import { articleBodyType } from "./shared/articleBody";
import { quotationServiceType, termsArticleType, venueType } from "./venue";
import { priceType, venueGameType } from "./venueGame";
import { venueEventType } from "./venueEvent";
import { globalGameType } from "./globalGame";
import { globalEventType } from "./globalEvent";
import { venuePageType } from "./venuePage";
import { rollingBannerType } from "./shared/pageComponents/rollingBanner";
import { reviewsType } from "./shared/pageComponents/reviews";
import { venuePricesType } from "./shared/pageComponents/venuePrices";
import { gamePricesType } from "./shared/pageComponents/gamePrices";
import { findUsType } from "./shared/pageComponents/findUs";
import { contactPanelsType } from "./shared/pageComponents/contactPanels";
import { clientContactFormType } from "./shared/pageComponents/clientContactForm";
import { quotationFormType } from "./shared/pageComponents/quotationForm";
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
import { textStripType } from "./shared/pageComponents/textStrip";
import { textBodyType } from "./shared/pageComponents/textBody";
import { videoEmbedType } from "./shared/pageComponents/videoEmbed";
import { textBlockType } from "./shared/textBlock";
import { blogSeoType, seoType } from "./shared/seo";

export const schemaTypes = [
  homepageType,
  joinTheNetworkPageType,
  contactPageType,
  whereToFindUsPageType,
  globalBookingPageType,
  legalNoticePageType,
  termsAndConditionsPageType,
  blogPageType,
  blogArticleType,
  articleBodyType,
  venueBlogType,
  blogFaqType,
  blogFindUsType,
  venueType,
  quotationServiceType,
  termsArticleType,
  venuePageType,
  venueGameType,
  venueEventType,
  globalGameType,
  globalEventType,
  priceType,
  siteSettingsType,
  teamMemberType,
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
  quotationFormType,
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
  textStripType,
  textBodyType,
  offersType,
  offerGroupType,
  offerCardType,
  offerListItemType,
  videoEmbedType,
  textBlockType,
  seoType,
  blogSeoType,
];
