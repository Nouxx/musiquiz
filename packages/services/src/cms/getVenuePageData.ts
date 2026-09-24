import {
  fetchVenuePage,
  type SanityVenuePage,
} from "@repo/api/sanity/venuePage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { VenuePage } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toPageCover } from "./utils/toPageCover";

function adaptVenuePage({ data }: { data: SanityVenuePage }): VenuePage {
  return {
    pageCover: toPageCover({ data: data.venuePage.pageCover }),
    components:
      data.venuePage.pageComponents?.map((component) =>
        adaptPageComponent(component),
      ) ?? [],
  };
}

export async function getVenuePageData({
  venueSlug,
  lang,
  config,
}: {
  venueSlug: string;
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchVenuePage({ config, lang, venueSlug });

  return adaptVenuePage({ data });
}
