import { defineArrayMember, defineType } from "sanity";

export const pageComponentsType = defineType({
  name: "pageComponents",
  title: "Page Components",
  type: "array",
  of: [
    defineArrayMember({ type: "rollingBanner" }),
    defineArrayMember({ type: "cardsGrid" }),
  ],
});
