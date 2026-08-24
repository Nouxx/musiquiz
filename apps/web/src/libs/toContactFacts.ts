import type { PageComponent } from "@repo/services/cms/pageComponent.types";
import type { ContactFact } from "@repo/ui/types";

import type { getT } from "./i18n";

type Translate = ReturnType<typeof getT>;

type FindUs = Extract<PageComponent, { type: "findUs" }>;

export function toContactFacts({
  component,
  t,
}: {
  component: FindUs;
  t: Translate;
}): ContactFact[] {
  return [
    {
      icon: "pin",
      label: t("findUs.address"),
      title: component.address,
      body: component.addressNote,
    },
    {
      icon: "clock",
      label: t("findUs.openingHours"),
      title: component.openingTitle,
      body: component.openingNote,
    },
    {
      icon: "phone",
      label: t("findUs.contact"),
      title: component.contactTitle,
      body: component.contactNote,
    },
  ];
}
