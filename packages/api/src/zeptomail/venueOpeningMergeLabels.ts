// the client's team reads the mail, so each key merges as the French wording
// they wrote in their brief, not as the value the form posts
export const venueOpeningMergeLabels = {
  profile: {
    projectHolder: "Porteur·se de projet, je veux créer mon activité",
    establishedEntrepreneur:
      "Entrepreneur·e déjà installé·e dans un autre secteur",
    leisureCentreManager:
      "Gérant·e d'un centre de loisirs / multi-activités existant",
    investor: "Investisseur·euse",
    other: "Autre",
  },
  intent: {
    dedicatedCentre: "Ouvrir un centre Musi'Quiz dédié (mono-activité)",
    multiActivityCentre: "Ouvrir un centre multi-activités",
    integrateExisting: "Intégrer Musi'Quiz dans un centre existant",
    exploring: "Je découvre, je veux d'abord en savoir plus",
  },
  population: {
    under50k: "Moins de 50 000 hab.",
    from50kTo150k: "50 000 à 150 000 hab.",
    from150kTo500k: "150 000 à 500 000 hab.",
    over500k: "Plus de 500 000 hab.",
  },
  premises: {
    secured: "J'ai déjà un local",
    shortlisted: "J'ai identifié des pistes",
    searching: "Je dois encore en chercher un",
    notNeeded: "Je n'en ai pas besoin (centre existant)",
  },
  horizon: {
    within6Months: "Dans les 6 prochains mois",
    from6To12Months: "Dans 6 à 12 mois",
    from12To24Months: "Dans 12 à 24 mois",
    undecided: "Pas encore défini",
  },
  contribution: {
    under5k: "Moins de 5 000 €",
    from5kTo10k: "5 000 € à 10 000 €",
    from10kTo20k: "10 000 € à 20 000 €",
    from20kTo50k: "20 000 € à 50 000 €",
    from50kTo80k: "50 000 € à 80 000 €",
    over80k: "Plus de 80 000 €",
  },
  experience: {
    firstVenture: "Ce serait ma première création",
    previousVentures: "J'ai déjà créé/géré une ou plusieurs entreprises",
    industryInsider:
      "Je travaille actuellement dans le secteur loisirs / restauration / événementiel",
  },
  partners: {
    alone: "Seul·e",
    onePartner: "Avec 1 associé·e",
    group: "En groupe (3+)",
    undecided: "Pas encore défini",
  },
  source: {
    played: "J'ai joué dans une salle Musi'Quiz",
    recommendation: "Recommandation",
    google: "Recherche Google",
    socialMedia: "Réseaux sociaux",
    press: "Presse",
    event: "Salon ou événement",
    other: "Autre",
  },
} as const;
