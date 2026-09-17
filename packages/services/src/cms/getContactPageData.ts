import {
  fetchContactPage,
  type SanityContactPage,
} from "@repo/api/sanity/contactPage";
import { getMailto } from "@repo/utils/getMailto";
import { getTel } from "@repo/utils/getTel";
import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { ContactPage } from "./types";
import { toCmsImage } from "./utils/toCmsImage";
import { toPageCover } from "./utils/toPageCover";

export const venuesContactId = "venues-contact";

function adaptContactPage(data: SanityContactPage): ContactPage {
  const { page, teamMembers, venues } = data;

  return {
    pageCover: toPageCover({
      data: page.pageCover,
      ctaUrl: `#${venuesContactId}`,
      ctaIcon: "arrow-down",
    }),
    team: {
      title: page.teamTitle,
      intro: page.teamIntro ?? undefined,
      members: teamMembers.map((member) => ({
        photo: toCmsImage(member.photo),
        name: member.name,
        role: member.role,
        jobTitle: member.jobTitle,
        tone: member.tone,
        mailLabel: member.email,
        mailHref: getMailto(member.email),
      })),
    },
    venues: {
      title: page.venuesTitle,
      intro: page.venuesIntro ?? undefined,
      items: venues.map((venue) => ({
        title: venue.title,
        logo: toCmsImage(venue.venueLogoDark),
        address: venue.addressLine,
        mailLabel: venue.mail,
        mailHref: getMailto(venue.mail),
        phoneLabel: venue.phone,
        phoneHref: getTel(venue.phone),
      })),
    },
  };
}

export async function getContactPageData({
  lang,
  config,
}: {
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchContactPage({ config, lang });

  return adaptContactPage(data);
}
