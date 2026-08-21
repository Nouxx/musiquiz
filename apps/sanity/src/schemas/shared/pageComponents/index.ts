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
  ],
});
