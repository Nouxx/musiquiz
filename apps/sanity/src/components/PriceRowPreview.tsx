import { currencyOf, type Currency } from "@repo/utils/currency";
import { formatPrice } from "@repo/utils/formatPrice";
import { SANITY_API_VERSION } from "@repo/utils/sanityConfig";
import { useEffect, useState } from "react";
import {
  useClient,
  useFormValue,
  type PreviewProps,
  type Reference,
} from "sanity";

type PriceRowPreviewProps = PreviewProps & {
  amount?: number;
  caption?: string;
  note?: string;
};

// a row's preview only selects its own fields, the venue sits on the document
function useVenueCurrency() {
  const client = useClient({ apiVersion: SANITY_API_VERSION });
  const venueId = (useFormValue(["venue"]) as Reference | undefined)?._ref;
  const [currency, setCurrency] = useState<Currency>();

  useEffect(() => {
    if (!venueId) return;

    let live = true;

    client
      .withConfig({ perspective: "drafts", useCdn: false })
      .fetch<string | null>(`*[_id == $venueId][0].addressCountry`, {
        venueId,
      })
      .then((country) => {
        if (live && country) setCurrency(currencyOf(country));
      });

    return () => {
      live = false;
    };
  }, [client, venueId]);

  return currency;
}

export function PriceRowPreview(props: PriceRowPreviewProps) {
  const { amount, caption, renderDefault } = props;
  const currency = useVenueCurrency();

  const price =
    amount == null || !currency
      ? undefined
      : formatPrice({ amount: amount, lang: "fr", currency });

  return renderDefault({
    ...props,
    subtitle: [price, caption].filter(Boolean).join(" · "),
  });
}
