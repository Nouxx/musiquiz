import {
  fetchVenuePage,
  type SanityVenuePage,
} from "@repo/api/sanity/venuePage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { LocalBusiness, VenuePage } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toOpeningHours } from "./utils/toOpeningHours";
import { toPageCover } from "./utils/toPageCover";
import { toSeo } from "./utils/toSeo";

function adaptBusiness(
  venue: SanityVenuePage["venuePage"]["venue"],
): LocalBusiness {
  const amounts = venue.priceAmounts;

  return {
    address: venue.address,
    geo: { latitude: venue.location.lat, longitude: venue.location.lng },
    telephone: venue.phone,
    email: venue.mail,
    mapUrl: venue.googleMapsLink,
    openingHours: toOpeningHours({
      Monday: venue.mondayOpeningHours,
      Tuesday: venue.tuesdayOpeningHours,
      Wednesday: venue.wednesdayOpeningHours,
      Thursday: venue.thursdayOpeningHours,
      Friday: venue.fridayOpeningHours,
      Saturday: venue.saturdayOpeningHours,
      Sunday: venue.sundayOpeningHours,
    }),
    priceRange:
      amounts.length > 0
        ? { lowest: Math.min(...amounts), highest: Math.max(...amounts) }
        : undefined,
  };
}

function adaptVenuePage({ data }: { data: SanityVenuePage }): VenuePage {
  return {
    venueTitle: data.venuePage.venueTitle,
    business: adaptBusiness(data.venuePage.venue),
    pageCover: toPageCover({ data: data.venuePage.pageCover }),
    seo: toSeo({
      data: data.venuePage.seo,
      fallback: {
        title: data.venuePage.pageCover.heading,
        description: data.venuePage.pageCover.subHeading,
      },
    }),
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
