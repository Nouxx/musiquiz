import type { PageComponent } from "@repo/services/cms/pageComponent.types";

import type { getT } from "./i18n";

type Translate = ReturnType<typeof getT>;

type ContactPanels = Extract<PageComponent, { type: "contactPanels" }>;

export function toContactPanels({
  component,
  t,
}: {
  component: ContactPanels;
  t: Translate;
}) {
  return {
    media: component.media,
    offer: {
      facts: [
        {
          icon: "mail" as const,
          label: component.quote.label,
          title: component.quote.title,
          body: component.quote.body,
        },
        {
          icon: "phone" as const,
          label: component.booking.label,
          title: component.booking.title,
          body: component.booking.body,
        },
      ],
      quoteCta: component.quoteCta,
      bookCta: {
        label: t("contactPanels.book"),
        ...component.bookingLink,
      },
    },
    questions: {
      title: t("contactPanels.questionsTitle"),
      body: t("contactPanels.questionsBody", { venue: component.venueTitle }),
      facts: [
        {
          icon: "phone" as const,
          label: t("contactPanels.phone"),
          title: component.phoneLabel,
          href: component.phoneHref,
        },
        {
          icon: "mail" as const,
          label: t("contactPanels.mail"),
          title: component.mailLabel,
          href: component.mailHref,
        },
      ],
    },
  };
}
