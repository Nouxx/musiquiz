// Whitespace is not a valid visual separator (it could be hyphens or dot) in a tel: URI (RFC 3966)
// and phone numbers are authored with spaces in the CMS "-", ".", "(" and ")"
// are permitted and kept as-is.
export function getTel(phone: string) {
  return `tel:${phone.replaceAll(/\s/g, "")}`;
}
