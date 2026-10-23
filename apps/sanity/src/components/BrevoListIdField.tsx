import { buildBrevoApiKeyName } from "@repo/services/form/buildBrevoApiKeyName";
import { isVenueSlug } from "@repo/utils/venueSlug";
import { useFormValue, type NumberFieldProps } from "sanity";

// a schema description is static, the secret name depends on this venue's slug
export function BrevoListIdField(props: NumberFieldProps) {
  const slug = useFormValue(["slug", "current"]) as string | undefined;

  const secret =
    slug && isVenueSlug(slug)
      ? `named ${buildBrevoApiKeyName(slug)}`
      : "named after the slug, once the slug is valid";

  return props.renderDefault({
    ...props,
    description: `${props.description} The account's API key goes in a Cloudflare Secret on musiquiz-worker ${secret}. Until that secret exists, sign-ups are mailed to the owners.`,
  });
}
