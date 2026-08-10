import type { SanityPageComponent } from "@repo/api/sanity/types";

import type { PageComponent } from "../pageComponent.types";


export function adaptPageComponent(data: SanityPageComponent): PageComponent {
  if (data._type === "rollingBanner")
    return {
      type: data._type,
      message: data.message,
    };

  return {
    type: data._type,
    text: data.text,
  };
}
