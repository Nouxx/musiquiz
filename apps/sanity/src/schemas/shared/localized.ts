import type { ValidationContext } from "sanity";

export type LocalizedEntry<T = string> = {
  _key?: string;
  language?: string;
  value?: T;
};

export const languages = [
  { id: "en", title: "English" },
  { id: "fr", title: "French" },
];

// a Studio preview shows one language, and French is the one always filled
export function frenchValue(entries?: LocalizedEntry[]) {
  return (
    entries?.find((entry) => entry.language === "fr")?.value ??
    entries?.[0]?.value
  );
}

type Block = { children?: { text?: string }[] };

// rich text is an array of blocks, and an empty editor still leaves one
function isFilled(value: unknown) {
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) {
    return (value as Block[]).some((block) =>
      block.children?.some((child) => child.text?.trim()),
    );
  }
  return value != null;
}

function missingLanguages(entries?: LocalizedEntry<unknown>[]) {
  return languages
    .filter(
      ({ id }) =>
        !entries?.some(
          (entry) => entry.language === id && isFilled(entry.value),
        ),
    )
    .map(({ id }) => id.toUpperCase());
}

export function isAnyLanguageFilled(entries?: LocalizedEntry<unknown>[]) {
  return missingLanguages(entries).length < languages.length;
}

// `rule.required()` passes as soon as the array has an entry, even an empty one.
// docs/adr/0029-localized-fields-require-every-language.md
export function requiredInEveryLanguage(
  when?: (context: ValidationContext) => boolean,
  message = "Required",
) {
  return function validate(
    entries: LocalizedEntry<unknown>[] | undefined,
    context: ValidationContext,
  ) {
    if (when && !when(context)) return true;

    const missing = missingLanguages(entries);

    return missing.length ? `${message}. Missing: ${missing.join(", ")}` : true;
  };
}

// an optional field filled in one language only renders empty in the other
export function noMissingLanguage(entries?: LocalizedEntry<unknown>[]) {
  const missing = missingLanguages(entries);

  if (!missing.length || missing.length === languages.length) return true;

  return `Fill every language or none. Missing: ${missing.join(", ")}`;
}

// the value is an array of one entry per language, so `min`/`max` would count languages
export function eachLanguage(check: (value: string) => string | undefined) {
  return function validate(entries?: LocalizedEntry<unknown>[]) {
    const messages = (entries ?? []).flatMap((entry) => {
      const message =
        typeof entry.value === "string" && entry.value
          ? check(entry.value)
          : undefined;

      return message
        ? [`${(entry.language ?? entry._key)?.toUpperCase()}: ${message}`]
        : [];
    });

    return messages.length ? messages.join(" ") : true;
  };
}

export function maxLengthInEveryLanguage(max: number, reason = "") {
  return eachLanguage((value) =>
    value.length > max
      ? `${value.length} characters, keep it to ${max}.${reason && ` ${reason}`}`
      : undefined,
  );
}
