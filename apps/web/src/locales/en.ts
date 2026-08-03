import type { fr } from "./fr";

/**
 * typed against the french resource, so a missing or misspelled key fails at build time
 */
export const en: typeof fr = {
  header: {
    home: "Accueil",
    experiences: "Our games",
    offerAGame: "Offer a game",
    book: "Book",
  },
};
