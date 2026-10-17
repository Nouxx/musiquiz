export type LocalizedEntry = { language?: string; value?: string };

// a Studio preview shows one language, and French is the one always filled
export function frenchValue(entries?: LocalizedEntry[]) {
  return (
    entries?.find((entry) => entry.language === "fr")?.value ??
    entries?.[0]?.value
  );
}
