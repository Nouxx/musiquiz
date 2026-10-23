// NFD splits "é" into "e" and a combining accent; ligatures and ß have no decomposition
const SPELLED_OUT: Record<string, string> = {
  œ: "oe",
  Œ: "oe",
  æ: "ae",
  Æ: "ae",
  ß: "ss",
  ẞ: "ss",
};

/** @example "Villeneuve-d'Ascq" → ["villeneuve", "d", "ascq"], "Saint-Étienne" → ["saint", "etienne"] */
export function splitIntoAsciiWords(value: string) {
  return value
    .normalize("NFD")
    .replaceAll(/\p{M}/gu, "")
    .replaceAll(/[œŒæÆßẞ]/g, (letter) => SPELLED_OUT[letter] ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}
