import {
  defineArrayMember,
  defineType,
  type SanityDocument,
  type ValidationContext,
} from "sanity";
import { hasWidget } from "../../venuePage";

const pricesTypes = ["venuePrices", "gamePrices"];

type Component = { _type: string };

// a hidden array keeps its old value, so only the rendered ones count
function renderedArrays(document: SanityDocument | undefined) {
  if (document?._type === "whereToFindUsPage") {
    return ["componentsBeforeMap", "componentsAfterMap"];
  }
  if (hasWidget(document?.pageType)) {
    return ["componentsBeforeWidget", "componentsAfterWidget"];
  }
  return ["pageComponents"];
}

// a page that display a price can either have
// - a gamePrices component
// - a venuePrices component
// - nothing (not a page that display prices)
// why? we add a #prices anchor to the "prices" component
function onePricesBlock(
  _value: Component[] | undefined,
  { document, path }: ValidationContext,
) {
  const arrays = renderedArrays(document);
  const field = path?.[0];

  if (typeof field !== "string" || !arrays.includes(field)) return true;

  const prices = arrays
    .flatMap((name) => (document?.[name] as Component[] | undefined) ?? [])
    .filter(({ _type }) => pricesTypes.includes(_type));

  if (prices.length > 1) {
    return "A page holds at most one Venue Prices or Game Prices block.";
  }
  if (
    document?.pageType === "book" &&
    field === "componentsBeforeWidget" &&
    prices[0]?._type !== "venuePrices"
  ) {
    return "The booking page needs one Venue Prices block, before or after the widget.";
  }
  return true;
}

export const pageComponentsType = defineType({
  name: "pageComponents",
  title: "Page Components",
  type: "array",
  validation: (rule) => rule.custom(onePricesBlock),
  of: [
    defineArrayMember({ type: "rollingBanner" }),
    defineArrayMember({ type: "cardsGrid" }),
    defineArrayMember({ type: "carousel" }),
    defineArrayMember({ type: "reviews" }),
    defineArrayMember({ type: "venuePrices" }),
    defineArrayMember({ type: "gamePrices" }),
    defineArrayMember({ type: "findUs" }),
    defineArrayMember({ type: "contactPanels" }),
    defineArrayMember({ type: "clientContactForm" }),
    defineArrayMember({ type: "quotationForm" }),
    defineArrayMember({ type: "logos" }),
    defineArrayMember({ type: "faq" }),
    defineArrayMember({ type: "cardsScroller" }),
    defineArrayMember({ type: "detailTabs" }),
    defineArrayMember({ type: "textSlideshow" }),
    defineArrayMember({ type: "textStrip" }),
    defineArrayMember({ type: "textBody" }),
    defineArrayMember({ type: "textCards" }),
    defineArrayMember({ type: "textCardsGrid" }),
    defineArrayMember({ type: "offers" }),
    defineArrayMember({ type: "videoEmbed" }),
  ],
});
