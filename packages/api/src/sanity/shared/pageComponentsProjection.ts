import type { Lang } from "@repo/utils/lang";

function rollingBannerProjection({ lang }: { lang: Lang }) {
  return `
    _type == "rollingBanner" => {
      "message": message[language == "${lang}"][0].value
    }
  `;
}

function dummyProjection() {
  return `
    _type == "dummyComponent" => {
      text
    }
  `;
}

export function pageComponentsProjection({ lang }: { lang: Lang }) {
  return `
    pageComponents[]{
      _type,
      ${rollingBannerProjection({ lang })},
      ${dummyProjection()},
    }
  `;
}
