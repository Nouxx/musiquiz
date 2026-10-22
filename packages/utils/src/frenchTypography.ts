/** Swaps an existing space for a narrow no-break one, so French punctuation never wraps alone. */
export function frenchTypography(text: string) {
  return text
    .replaceAll(/[ \u{A0}]([?!:;»])/gu, "\u{202F}$1")
    .replaceAll(/«[ \u{A0}]/gu, "«\u{202F}");
}

/** Same as `frenchTypography`, across adjacent spans: `["Prêt ", "?"]` binds too. */
export function frenchTypographySpans(spans: string[]) {
  // every swap is one character for one, so the joined text splits back at the original lengths
  const joined = frenchTypography(spans.join(""));
  let start = 0;

  return spans.map((span) => {
    const end = start + span.length;
    const slice = joined.slice(start, end);
    start = end;
    return slice;
  });
}
