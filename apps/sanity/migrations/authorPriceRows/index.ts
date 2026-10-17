import { randomBytes } from "node:crypto";
import { at, defineMigration, set } from "sanity/migrate";

type OldPrice = {
  _key: string;
  _type: "price";
  playerCountFrom?: number;
  playerCountTo?: number;
  amount?: number;
  note?: unknown;
  label?: unknown;
};

type Lang = "fr" | "en";

function players(count: number, lang: Lang) {
  if (lang === "fr") return count > 1 ? `${count} joueurs` : `${count} joueur`;
  return count > 1 ? `${count} players` : `${count} player`;
}

// same wording the front built from the counts, so pages read as before
function label(
  { playerCountFrom: from, playerCountTo: to }: OldPrice,
  lang: Lang,
) {
  if (from == null) return lang === "fr" ? "Tarif unique" : "Single rate";

  if (to == null) {
    return lang === "fr"
      ? `${players(from, lang)} et plus`
      : `${players(from, lang)} and up`;
  }

  if (to === from) return players(from, lang);

  return lang === "fr"
    ? `De ${from} à ${players(to, lang)}`
    : `From ${from} to ${players(to, lang)}`;
}

function localized(values: Record<Lang, string>) {
  return (Object.keys(values) as Lang[]).map((language) => ({
    _key: randomBytes(6).toString("hex"),
    _type: "internationalizedArrayStringValue",
    language,
    value: values[language],
  }));
}

export default defineMigration({
  title: "Author price labels, icons and captions",
  documentTypes: ["venueGame"],
  migrate: {
    document(doc) {
      const prices = doc.prices as OldPrice[] | undefined;

      if (!prices?.length || prices.every((price) => price.label)) return;

      return at(
        "prices",
        set(
          prices.map((price) => {
            if (price.label) return price;

            const { playerCountFrom, playerCountTo, ...rest } = price;

            return {
              ...rest,
              label: localized({
                fr: label(price, "fr"),
                en: label(price, "en"),
              }),
              icon: playerCountFrom == null ? "coins" : "users-2",
              caption: localized({ fr: "Par personne", en: "Per person" }),
            };
          }),
        ),
      );
    },
  },
});
