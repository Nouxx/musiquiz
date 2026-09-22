import type { fr } from "./fr";

export const en: typeof fr = {
  cover: {
    chooseVenue: "Choose your Musi'Quiz venue",
  },
  venues: {
    badge: "Our venues",
    heading: "Find a Musi'Quiz venue near you!",
  },
  carousel: {
    previous: "Previous image",
    next: "Next image",
    goToImage: "Go to image",
  },
  prices: {
    perPerson: "Per person",
    book: "Book your activity",
    // shown when a game has a single price: it applies whatever the group size
    unique: "Single rate",
    range: "From {{from}} to {{to}} players",
    fromOnly_one: "{{count}} player and up",
    fromOnly_other: "{{count}} players and up",
    exact_one: "{{count}} player",
    exact_other: "{{count}} players",
  },
  cardsScroller: {
    nextCard: "Next card",
  },
  detailTabs: {
    chooseGroup: "Choose a category",
  },
  faq: {
    badge: "FAQ",
  },
  reviews: {
    previous: "Previous review",
    next: "Next review",
    stars: "{{score}} out of 5",
  },
  header: {
    home: "Home",
    concept: "Concept",
    events: "Events",
    experiences: "Our games",
    offerAGame: "Offer a game",
    book: "Book",
    changeVenue: "Switch venue",
    closeLabel: "Close",
  },
  footer: {
    whereToFindUs: "Where to find us",
    contact: "Contact",
    blog: "Blog",
    press: "Press",
    joinTheNetwork: "Open your Musi'quiz franchise",
    termsAndConditions: "T&C",
    gdpr: "GDPR",
    legalNotice: "Legal notice",
    chooseVenue: "Choose a venue",
    changeVenue: "Switch venue",
    ourVenues: "Our venues",
    changeVenueDescription:
      "Musi'Quiz, the new generation of quiz venues for your bachelor/bachelorette parties, team building, and nights out with family or friends!",
    paymentMethods: "Payment methods",
    venueOpenHours: "{{venue}} opening hours",
    phone: "Phone",
    mail: "Mail",
    directions: "Directions",
    openDirections: "Open directions",
    ourGames: "Our games",
    ourVenueGames: "Our games in this venue",
    generalInformation: "General information",
    socials: "Follow us",
    subscribe: "Subscribe to our newsletter",
    subscribeCta: "Subscribe to the newsletter",
    mailAddress: "Mail address",
    mailPlaceholder: "Your mail address",
    newsletterConsent: "I agree to receive information from Musi'Quiz",
  },
  contactPage: {
    ctaLabel: "Our contact details",
    writeTo: "Send an email",
    venueName: "Musi'Quiz {{city}}",
  },
  whereToFindUsPage: {
    ctaLabel: "See our venues",
  },
  blogPage: {
    badge: "Blog",
    readArticle: "Read the article",
    pagination: "Pagination",
    previousPage: "Previous page",
    nextPage: "Next page",
    page: "Page {{page}}",
    pageTitle: "{{title}} – page {{page}}",
  },
  joinTheNetworkPage: {
    ctaLabel: "Request our brochure",
  },
  venueBookingPage: {
    ctaLabel: "Choose my activity",
    secondaryCtaLabel: "Prices",
  },
  venueGiftingPage: {
    ctaLabel: "Choose my activity",
  },
  termsAndConditionsPage: {
    indexLabel: "The terms and conditions depend on the venue you book at",
    venueTitle: "Terms and Conditions Musi'Quiz {{venue}}",
    articleTitle: "Article {{number}} · {{title}}",
  },
  findUs: {
    address: "Address",
    openingHours: "Opening hours",
    contact: "Contact",
    mapTitle: "The Musi'Quiz venue in {{venue}} on the map",
    viewOnGoogleMaps: "View on Google Maps",
  },
  contactPanels: {
    questionsTitle: "Any questions?",
    questionsBody:
      "Contact the Musi'Quiz {{venue}} sales team, Monday to Saturday:",
    phone: "By phone",
    mail: "By email",
    book: "Book instantly",
  },
  offers: {
    book: "Book instantly",
    quotation: "On quote",
  },
  form: {
    errors: {
      required: "Required field",
      mail: "Invalid mail address",
    },
    counter: "{{used}} / {{max}} characters",
  },
  contactForm: {
    badge: "Contact us",
    title: "A question?",
    mediaLabel: "Photos of our venues",
    firstName: "First name",
    firstNamePlaceholder: "Your first name",
    mail: "Mail address",
    mailPlaceholder: "Your mail address",
    phone: "Phone",
    phonePlaceholder: "Your phone number",
    message: "Message",
    messagePlaceholder: "Your message",
    submit: "Send",
    pending: "Sending…",
    success: "Thanks, your message has arrived. We'll get back to you shortly.",
    failure: "Something went wrong. Please try again.",
  },
  quotationForm: {
    teamBuilding: {
      badge: "Quote",
      title: "Request your quote",
      lastName: "Last name",
      lastNamePlaceholder: "Your last name",
      firstName: "First name",
      firstNamePlaceholder: "Your first name",
      phone: "Phone",
      phonePlaceholder: "Your mobile or direct line",
      mail: "Email address",
      mailPlaceholder: "Your email",
      company: "Company",
      companyPlaceholder: "The legal entity to show on the quote / invoice",
      date: "Preferred date",
      time: "Preferred time",
      participants: "Participants",
      participantsPlaceholder: "Number of participants",
      budget: "Budget",
      budgetPlaceholder: "Do you have a budget",
      services: "Which service would you like?",
      message: "Message",
      messagePlaceholder:
        "Tell us what you expect from your team building, any specific needs, the company name to show on our welcome screens on the day,...",
      submit: "Send",
      pending: "Sending…",
      success:
        "Thanks, your quote request has arrived. We'll get back to you shortly.",
      failure: "Something went wrong. Please try again.",
    },
    musiTeens: {
      badge: "Quote",
      title: "Request your quote",
      lastName: "Last name",
      lastNamePlaceholder: "Your last name",
      firstName: "First name",
      firstNamePlaceholder: "Your first name",
      phone: "Phone",
      phonePlaceholder: "Your mobile or direct line",
      mail: "Email address",
      mailPlaceholder: "Your email",
      company: "Company",
      companyPlaceholder:
        "The legal entity to show on the quote / invoice, if any",
      date: "Preferred date",
      time: "Preferred time",
      participants: "Participants",
      participantsPlaceholder: "Number of participants",
      budget: "Budget",
      budgetPlaceholder: "Do you have a budget",
      services: "Which service would you like?",
      message: "Message",
      messagePlaceholder:
        "Tell us what you expect from your Musi'Teens, any specific needs, the age of the group, the name to show on our welcome screens on the day,...",
      submit: "Send",
      pending: "Sending…",
      success:
        "Thanks, your quote request has arrived. We'll get back to you shortly.",
      failure: "Something went wrong. Please try again.",
    },
  },
  venueOpeningForm: {
    title: "Request our brochure",
    intro:
      "Are you an entrepreneur, or would you like to become one? Do you have a project to create or grow a leisure brand in a city in France or abroad?",
    progressLabel: "Form progress",
    steps: {
      profile: {
        title: "Tell us about yourself",
        description: "Two quick questions so we understand your project.",
      },
      area: {
        title: "Your area and your timing",
        description: "Your project makes more sense once we know its context.",
      },
      finance: {
        title: "The financial and entrepreneurial side",
        description:
          "No commitment — this is simply to understand your investment capacity.",
      },
      contact: {
        title: "Let's stay in touch",
        description:
          "Leave your full details here so we can get back to you quickly!",
      },
    },
    fields: {
      profile: {
        label: "You are",
        options: {
          projectHolder: "A project founder, I want to start my own business",
          establishedEntrepreneur:
            "An entrepreneur already established in another sector",
          leisureCentreManager:
            "The manager of an existing leisure or multi-activity centre",
          investor: "An investor",
          other: "Other",
        },
      },
      intent: {
        label: "Your intention",
        options: {
          dedicatedCentre:
            "Open a dedicated Musi'Quiz centre (single activity)",
          multiActivityCentre: "Open a multi-activity centre",
          integrateExisting: "Add Musi'Quiz to an existing centre",
          exploring: "Just exploring, I want to know more first",
        },
      },
      city: {
        label: "City or area considered",
        placeholder: "E.g. Marseille, Bordeaux, Madrid",
      },
      population: {
        label: "Population of the catchment area",
        placeholder: "Choose",
        options: {
          under50k: "Under 50,000 inhabitants",
          from50kTo150k: "50,000 to 150,000 inhabitants",
          from150kTo500k: "150,000 to 500,000 inhabitants",
          over500k: "Over 500,000 inhabitants",
        },
      },
      premises: {
        label: "Your commercial premises",
        options: {
          secured: "I already have premises",
          shortlisted: "I have shortlisted some options",
          searching: "I still have to find some",
          notNeeded: "I don't need any (existing centre)",
        },
      },
      horizon: {
        label: "Launch horizon",
        placeholder: "Your horizon",
        options: {
          within6Months: "Within the next 6 months",
          from6To12Months: "In 6 to 12 months",
          from12To24Months: "In 12 to 24 months",
          undecided: "Not decided yet",
        },
      },
      contribution: {
        label: "Personal funds available",
        placeholder: "Your personal funds?",
        options: {
          under5k: "Under €5,000",
          from5kTo10k: "€5,000 to €10,000",
          from10kTo20k: "€10,000 to €20,000",
          from20kTo50k: "€20,000 to €50,000",
          from50kTo80k: "€50,000 to €80,000",
          over80k: "Over €80,000",
        },
      },
      experience: {
        label: "Entrepreneurial experience",
        options: {
          firstVenture: "This would be my first venture",
          previousVentures:
            "I have already founded or run one or more businesses",
          industryInsider:
            "I currently work in the leisure, hospitality or events industry",
        },
      },
      partners: {
        label: "Partners on this project",
        options: {
          alone: "On my own",
          onePartner: "With 1 partner",
          group: "As a group (3+)",
          undecided: "Not decided yet",
        },
      },
      firstName: {
        label: "First name",
        placeholder: "Your first name",
      },
      lastName: {
        label: "Last name",
        placeholder: "Your last name",
      },
      mail: {
        label: "Email address",
        placeholder: "Your email address",
      },
      phone: {
        label: "Phone",
        placeholder: "Your phone number",
      },
      source: {
        label: "How did you hear about Musi'Quiz?",
        placeholder: "Choose",
        options: {
          played: "I played at a Musi'Quiz venue",
          recommendation: "Recommendation",
          google: "Google search",
          socialMedia: "Social media",
          press: "Press",
          event: "Trade show or event",
          other: "Other",
        },
      },
      message: {
        label: "Anything to add?",
        placeholder: "Optional",
      },
      rgpd: {
        label: "GDPR",
        consent:
          "I agree to receive communications from Musi'Quiz regarding my project.",
      },
    },
    previous: "Previous",
    next: "Next",
    submit: "Send my request",
    pending: "Sending…",
    success:
      "Thank you, we have received your request. We will get back to you shortly.",
    failure: "Something went wrong. Please try again.",
  },
  days: {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  },
};
