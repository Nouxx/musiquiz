import type { Organization } from "@repo/services/cms/types";
import { getRoutesForLang } from "@repo/services/routing/getRoutesForLang";
import type { Lang } from "@repo/utils/lang";

import { getOrganizationId } from "./getOrganizationId";
import { getVenueBusinessId } from "./getVenueBusinessId";
import { getWebsiteId } from "./getWebsiteId";

export function toSiteGraph({
  site,
  lang,
  logoUrl,
  organization,
}: {
  site: URL;
  lang: Lang;
  logoUrl: string;
  organization: Organization;
}) {
  const organizationId = getOrganizationId(site);

  const organizationNode = {
    "@type": "Organization",
    "@id": organizationId,
    name: "Musi'Quiz",
    url: site.href,
    logo: logoUrl,
    sameAs: organization.sameAs,
    telephone: organization.telephone,
    email: organization.email,
    subOrganization: organization.venues.map(({ slug }) => ({
      "@id": getVenueBusinessId(site, slug),
    })),
  };

  const website = {
    "@type": "WebSite",
    "@id": getWebsiteId(site),
    name: "Musi'Quiz",
    url: site.href,
    inLanguage: ["fr", "en"],
    publisher: { "@id": organizationId },
  };

  // a reference must resolve on the page; the venue home adds the full facts
  const venueBusinesses = organization.venues.map(({ slug, city }) => ({
    "@type": "EntertainmentBusiness",
    "@id": getVenueBusinessId(site, slug),
    name: `Musi'Quiz ${city}`,
    url: new URL(getRoutesForLang(lang).venueHome(slug), site).href,
    parentOrganization: { "@id": organizationId },
  }));

  return [organizationNode, website, ...venueBusinesses];
}
