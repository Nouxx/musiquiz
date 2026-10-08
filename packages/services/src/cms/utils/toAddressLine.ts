import type { SanityAddress } from "@repo/api/sanity/shared/address";

/** @example "10 Boulevard Poissonnière, 75002 Paris" */
export function toAddressLine(address: SanityAddress) {
  return `${address.streetAddress}, ${address.postalCode} ${address.addressLocality}`;
}
