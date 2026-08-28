import { defineArrayMember, defineType } from "sanity";

export const pageComponentsType = defineType({
  name: "pageComponents",
  title: "Page Components",
  type: "array",
  of: [
    defineArrayMember({ type: "rollingBanner" }),
    defineArrayMember({ type: "cardsGrid" }),
    defineArrayMember({ type: "carousel" }),
    defineArrayMember({ type: "reviews" }),
    defineArrayMember({ type: "venuePrices" }),
    defineArrayMember({ type: "gamePrices" }),
    defineArrayMember({ type: "findUs" }),
    defineArrayMember({ type: "clientContactForm" }),
    defineArrayMember({ type: "logos" }),
    defineArrayMember({ type: "faq" }),
    defineArrayMember({ type: "cardsScroller" }),
    defineArrayMember({ type: "detailTabs" }),
    defineArrayMember({ type: "textSlideshow" }),
    defineArrayMember({ type: "textCards" }),
    defineArrayMember({ type: "videoEmbed" }),
  ],
});
