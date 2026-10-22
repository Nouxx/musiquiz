/** Swaps an existing space for a narrow no-break one, so French punctuation never wraps alone. */
export function frenchTypography(text: string) {
  return text
    .replaceAll(/[ \u{A0}]([?!:;»])/gu, "\u{202F}$1")
    .replaceAll(/«[ \u{A0}]/gu, "«\u{202F}");
}
