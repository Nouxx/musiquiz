// no dependencies: runs in the browser (dev toolbar) and in Node

export type Level = "error" | "warning" | "info";
export type Issue = {
  level: Level;
  path: string;
  message: string;
  block: number;
};
export type BlockResult = {
  index: number;
  raw: string;
  data: unknown;
  types: string[];
  issues: Issue[];
};
export type PageResult = {
  blocks: BlockResult[];
  issues: Issue[];
  counts: Record<Level, number>;
};

type Environment = "dev" | "build";
type JsonObject = Record<string, unknown>;
type Add = (level: Level, path: string, message: string) => void;
type Reference = { id: string; path: string; block: number };
type Definitions = Map<
  string,
  { types: string[]; path: string; block: number }
>;
type WalkContext = {
  add: Add;
  environment: Environment;
  defined: Definitions;
  references: Reference[];
  blockIndex: number;
  types: Set<string>;
};

const ARTICLE = [
  "Article",
  "BlogPosting",
  "NewsArticle",
  "TechArticle",
  "ScholarlyArticle",
  "Report",
  "SocialMediaPosting",
  "LiveBlogPosting",
];
const LOCAL_BUSINESS = [
  "LocalBusiness",
  "Restaurant",
  "Store",
  "CafeOrCoffeeShop",
  "Bakery",
  "BarOrPub",
  "Dentist",
  "Hotel",
  "MedicalClinic",
  "ProfessionalService",
  "LegalService",
  "AutoRepair",
  "HealthAndBeautyBusiness",
  "SportsActivityLocation",
  "LodgingBusiness",
  "FoodEstablishment",
];

/** Common schema.org types — used to catch typos like "Blogposting". */
const KNOWN_TYPES = new Set([
  "Thing",
  "CreativeWork",
  "WebSite",
  "WebPage",
  "AboutPage",
  "ContactPage",
  "CollectionPage",
  "ProfilePage",
  "FAQPage",
  "QAPage",
  "ItemPage",
  "SearchResultsPage",
  "CheckoutPage",
  "MedicalWebPage",
  "RealEstateListing",
  "WebPageElement",
  "SiteNavigationElement",
  "WPHeader",
  "WPFooter",
  "WPSideBar",
  ...ARTICLE,
  ...LOCAL_BUSINESS,
  "Organization",
  "Corporation",
  "EducationalOrganization",
  "NGO",
  "OnlineStore",
  "OnlineBusiness",
  "NewsMediaOrganization",
  "Person",
  "PostalAddress",
  "ContactPoint",
  "GeoCoordinates",
  "Place",
  "VirtualLocation",
  "OpeningHoursSpecification",
  "Country",
  "City",
  "BreadcrumbList",
  "ItemList",
  "ListItem",
  "HowTo",
  "HowToStep",
  "HowToSection",
  "HowToSupply",
  "HowToTool",
  "ImageObject",
  "VideoObject",
  "AudioObject",
  "MediaObject",
  "Clip",
  "SpeakableSpecification",
  "Product",
  "ProductGroup",
  "Offer",
  "AggregateOffer",
  "Brand",
  "Review",
  "Rating",
  "AggregateRating",
  "MerchantReturnPolicy",
  "OfferShippingDetails",
  "MonetaryAmount",
  "QuantitativeValue",
  "PriceSpecification",
  "UnitPriceSpecification",
  "Event",
  "MusicEvent",
  "BusinessEvent",
  "EducationEvent",
  "SportsEvent",
  "Festival",
  "EventStatusType",
  "EventAttendanceModeEnumeration",
  "Recipe",
  "NutritionInformation",
  "Question",
  "Answer",
  "Course",
  "CourseInstance",
  "JobPosting",
  "SoftwareApplication",
  "WebApplication",
  "MobileApplication",
  "SoftwareSourceCode",
  "Book",
  "Movie",
  "MusicRecording",
  "MusicAlbum",
  "MusicGroup",
  "Podcast",
  "PodcastSeries",
  "PodcastEpisode",
  "Dataset",
  "DataDownload",
  "DataCatalog",
  "Collection",
  "SearchAction",
  "EntryPoint",
  "ReadAction",
  "WatchAction",
  "BuyAction",
  "InteractionCounter",
  "DefinedTerm",
  "DefinedTermSet",
  "Language",
  "Duration",
  "PropertyValue",
  "Claim",
  "ClaimReview",
  "Comment",
  "DiscussionForumPosting",
  "EmployerAggregateRating",
  "Occupation",
  "Vehicle",
  "Car",
]);
const KNOWN_LOWER = new Map([...KNOWN_TYPES].map((t) => [t.toLowerCase(), t]));

/**
 * Rules follow Google Search Central structured-data docs.
 * required → error (rich result won't be eligible). recommended → info.
 * oneOf → at least one of the listed properties must be present.
 */
type Rule = {
  required?: string[];
  oneOf?: string[][];
  recommended?: string[];
};

const articleRule: Rule = {
  recommended: ["headline", "image", "datePublished", "dateModified", "author"],
};
const businessRule: Rule = {
  required: ["name", "address"],
  recommended: [
    "url",
    "telephone",
    "image",
    "openingHoursSpecification",
    "geo",
  ],
};
const RULES: Record<string, Rule> = {
  ...Object.fromEntries(ARTICLE.map((t) => [t, articleRule])),
  ...Object.fromEntries(LOCAL_BUSINESS.map((t) => [t, businessRule])),
  WebSite: { recommended: ["name", "url"] },
  WebPage: { recommended: ["name", "url"] },
  Organization: { recommended: ["name", "url", "logo"] },
  Person: { required: ["name"], recommended: ["url"] },
  BreadcrumbList: { required: ["itemListElement"] },
  ListItem: { required: ["position"] },
  FAQPage: { required: ["mainEntity"] },
  Question: { required: ["name", "acceptedAnswer"] },
  Answer: { required: ["text"] },
  Product: {
    required: ["name"],
    oneOf: [["offers", "review", "aggregateRating"]],
    recommended: ["image", "description", "brand", "sku"],
  },
  Offer: {
    required: ["price", "priceCurrency"],
    recommended: ["availability", "url"],
  },
  AggregateOffer: {
    required: ["lowPrice", "priceCurrency"],
    recommended: ["highPrice", "offerCount"],
  },
  AggregateRating: {
    required: ["ratingValue"],
    oneOf: [["ratingCount", "reviewCount"]],
  },
  Review: { required: ["author", "reviewRating"] },
  Rating: { required: ["ratingValue"] },
  Event: {
    required: ["name", "startDate", "location"],
    recommended: [
      "endDate",
      "eventStatus",
      "image",
      "description",
      "offers",
      "organizer",
    ],
  },
  Recipe: {
    required: ["name", "image"],
    recommended: [
      "author",
      "datePublished",
      "description",
      "recipeIngredient",
      "recipeInstructions",
      "totalTime",
    ],
  },
  VideoObject: {
    required: ["name", "thumbnailUrl", "uploadDate"],
    recommended: ["description", "duration", "contentUrl", "embedUrl"],
  },
  ImageObject: { oneOf: [["url", "contentUrl"]] },
  HowTo: { required: ["name", "step"] },
  JobPosting: {
    required: ["title", "description", "datePosted", "hiringOrganization"],
    recommended: [
      "validThrough",
      "employmentType",
      "jobLocation",
      "baseSalary",
    ],
  },
  SoftwareApplication: {
    required: ["name"],
    oneOf: [["offers"], ["aggregateRating", "review"]],
  },
  Course: { required: ["name", "description"], recommended: ["provider"] },
  DiscussionForumPosting: {
    required: ["author", "datePublished"],
    oneOf: [["text", "image", "video"]],
  },
  PostalAddress: {
    recommended: [
      "streetAddress",
      "addressLocality",
      "postalCode",
      "addressCountry",
    ],
  },
  SearchAction: { required: ["target"] },
};

const DATE_PROPS = new Set([
  "datePublished",
  "dateModified",
  "dateCreated",
  "datePosted",
  "uploadDate",
  "startDate",
  "endDate",
  "validFrom",
  "validThrough",
  "priceValidUntil",
  "birthDate",
  "deathDate",
  "foundingDate",
  "expires",
  "availabilityStarts",
  "availabilityEnds",
  "temporalCoverage",
]);
const URL_PROPS = new Set([
  "url",
  "logo",
  "image",
  "thumbnailUrl",
  "contentUrl",
  "embedUrl",
  "sameAs",
  "mainEntityOfPage",
  "license",
  "discussionUrl",
  "item",
  "urlTemplate",
  "hasMap",
  "downloadUrl",
  "installUrl",
  "thumbnail",
]);

const ISO_DATE =
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(T([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d+)?)?(Z|[+-]([01]\d|2[0-3]):?[0-5]\d)?)?$/;
const LOCALHOST =
  /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?(\/|$)/i;

function isObject(v: unknown): v is JsonObject {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function asArray(v: unknown): unknown[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

function isEmpty(v: unknown) {
  return (
    v === null ||
    v === undefined ||
    v === "" ||
    (Array.isArray(v) && v.length === 0) ||
    (isObject(v) && Object.keys(v).length === 0)
  );
}

function stripPrefix(type: string) {
  return type.replace(/^(https?:\/\/schema\.org\/|schema:)/i, "");
}

function joinPath(path: string, key: string | number) {
  if (typeof key === "number") return `${path}[${key}]`;
  return /^[A-Za-z_$][\w$]*$/.test(key)
    ? `${path}.${key}`
    : `${path}["${key}"]`;
}

/** Parse one <script type="application/ld+json"> body. */
export function parseBlock(raw: string | undefined): {
  data?: unknown;
  error?: string;
  hint?: string;
} {
  const text = (raw ?? "").trim();
  if (!text) return { error: "Empty JSON-LD block." };

  let hint: string | undefined;
  if (/&quot;|&#34;|&#x22;/.test(text)) {
    hint =
      'The JSON looks HTML-escaped. In Astro, render it with <script type="application/ld+json" set:html={JSON.stringify(data)} />.';
  }
  try {
    return { data: JSON.parse(text), hint };
  } catch (error) {
    let message = error instanceof Error ? error.message : String(error);
    const m = /position (\d+)/.exec(message);
    if (m && !/line \d+/.test(message)) {
      const pos = Number(m[1]);
      const before = text.slice(0, pos);
      const line = before.split("\n").length;
      const col = pos - before.lastIndexOf("\n");
      message += ` (line ${line}, column ${col})`;
    }
    const posMatch = /position (\d+)/.exec(message);
    if (posMatch) {
      const p = Number(posMatch[1]);
      const snippet = text
        .slice(Math.max(0, p - 30), p + 30)
        .replaceAll(/\s+/g, " ");
      message += ` near: …${snippet}…`;
    }
    if (/,\s*[}\]]/.test(text))
      hint ??= "There may be a trailing comma — JSON does not allow them.";
    return { error: message, hint };
  }
}

/** @param blocks raw script contents, in document order */
export function validatePage(
  blocks: string[],
  options: { env?: Environment } = {},
): PageResult {
  const environment = options.env ?? "build";
  const issues: Issue[] = [];
  const defined: Definitions = new Map();
  const references: Reference[] = [];

  const results = blocks.map((raw, blockIndex) =>
    validateBlock(raw, {
      blockIndex,
      environment,
      issues,
      defined,
      references,
    }),
  );

  for (const reference of references) {
    if (reference.id.startsWith("_:")) continue;
    if (!defined.has(reference.id)) {
      const issue: Issue = {
        level: "warning",
        path: reference.path,
        block: reference.block,
        message: `@id reference "${reference.id}" doesn't match any node on this page. Google only reads what's on the page, so this node is empty for it.`,
      };
      issues.push(issue);
      results[reference.block]?.issues.push(issue);
    }
  }

  const order: Record<Level, number> = { error: 0, warning: 1, info: 2 };
  for (const r of results)
    r.issues.sort((a, b) => order[a.level] - order[b.level]);
  function count(level: Level) {
    return issues.filter((issue) => issue.level === level).length;
  }
  return {
    blocks: results,
    issues,
    counts: {
      error: count("error"),
      warning: count("warning"),
      info: count("info"),
    },
  };
}

function validateBlock(
  raw: string,
  {
    blockIndex,
    environment,
    issues,
    defined,
    references,
  }: Omit<WalkContext, "add" | "types"> & { issues: Issue[] },
): BlockResult {
  const blockIssues: Issue[] = [];
  function add(level: Level, path: string, message: string) {
    const issue: Issue = { level, path, message, block: blockIndex };
    blockIssues.push(issue);
    issues.push(issue);
  }

  const parsed = parseBlock(raw);
  if (parsed.hint) add(parsed.error ? "info" : "warning", "$", parsed.hint);
  if (parsed.error) {
    add("error", "$", `Invalid JSON: ${parsed.error}`);
    return {
      index: blockIndex,
      raw,
      data: undefined,
      types: [],
      issues: blockIssues,
    };
  }

  const data = parsed.data;
  const types = new Set<string>();
  const context: WalkContext = {
    add,
    environment,
    defined,
    references,
    blockIndex,
    types,
  };

  if (!Array.isArray(data) && !isObject(data))
    add("error", "$", "Top level must be an object or an array of objects.");
  const roots: [unknown, string][] = Array.isArray(data)
    ? data.map((d, index) => [d, `$[${index}]`])
    : [[data, "$"]];
  for (const [root, path] of roots) {
    if (!isObject(root)) {
      add("error", path, "Expected an object.");
      continue;
    }
    checkContext(root["@context"], path, add);
    walk(root, path, context, undefined, true);
  }

  return {
    index: blockIndex,
    raw,
    data,
    types: [...types],
    issues: blockIssues,
  };
}

function checkContext(context: unknown, path: string, add: Add) {
  if (context === undefined) {
    add("error", path, 'Missing "@context". Use "https://schema.org".');
    return;
  }
  const values = asArray(context).filter(
    (c): c is string => typeof c === "string",
  );
  const objectVocab = asArray(context).some(
    (c) =>
      isObject(c) &&
      typeof c["@vocab"] === "string" &&
      /schema\.org/i.test(c["@vocab"]),
  );
  if (
    !objectVocab &&
    values.every((c) => !/^https?:\/\/schema\.org\/?$/i.test(c))
  ) {
    add(
      "warning",
      joinPath(path, "@context"),
      `"@context" is ${JSON.stringify(context)} — expected "https://schema.org".`,
    );
  } else if (values.some((c) => /^http:\/\//i.test(c))) {
    add(
      "info",
      joinPath(path, "@context"),
      // eslint-disable-next-line unicorn/prefer-https -- names the http form on purpose
      '"http://schema.org" works, but "https://schema.org" is the current form.',
    );
  }
}

function walk(
  value: unknown,
  path: string,
  context: WalkContext,
  parentKey: string | undefined,
  isRoot = false,
) {
  if (Array.isArray(value)) {
    for (const [index, v] of value.entries())
      walk(v, joinPath(path, index), context, parentKey);
    return;
  }
  if (!isObject(value)) return;
  if ("@value" in value || "@list" in value) return;

  const keys = Object.keys(value).filter((k) => k !== "@context");
  const isGraphWrapper =
    isRoot &&
    "@graph" in value &&
    keys.every((k) => k === "@graph" || k === "@id");

  if (!isGraphWrapper) checkNode(value, path, context, parentKey, isRoot);

  for (const key of keys) {
    if (key === "@type" || key === "@id") continue;
    walk(value[key], joinPath(path, key), context, key);
  }
}

function checkNode(
  node: JsonObject,
  path: string,
  context: WalkContext,
  parentKey: string | undefined,
  isRoot: boolean,
) {
  const { add, environment } = context;
  const keys = Object.keys(node).filter((k) => k !== "@context");

  if (keys.length === 1 && keys[0] === "@id") {
    if (typeof node["@id"] === "string")
      context.references.push({
        id: node["@id"],
        path,
        block: context.blockIndex,
      });
    return;
  }

  const rawTypes = asArray(node["@type"]);
  if (rawTypes.length === 0) {
    const where = parentKey ? ` (value of "${parentKey}")` : "";
    add(
      isRoot ? "error" : "warning",
      path,
      `Node has properties but no "@type"${where}.`,
    );
  }
  const types: string[] = [];
  for (const t of rawTypes) {
    if (typeof t !== "string" || !t) {
      add(
        "error",
        joinPath(path, "@type"),
        `"@type" must be a non-empty string, got ${JSON.stringify(t)}.`,
      );
      continue;
    }
    const clean = stripPrefix(t);
    types.push(clean);
    context.types.add(clean);
    if (!KNOWN_TYPES.has(clean)) {
      const fix = KNOWN_LOWER.get(clean.toLowerCase());
      if (fix)
        add(
          "error",
          joinPath(path, "@type"),
          `Unknown type "${clean}" — did you mean "${fix}"? Types are case-sensitive.`,
        );
      else
        add(
          "info",
          joinPath(path, "@type"),
          `"${clean}" isn't in this tool's list of common types, so its spelling can't be checked offline.`,
        );
    }
  }

  if (typeof node["@id"] === "string") {
    const id = node["@id"];
    const previous = context.defined.get(id);
    if (
      previous &&
      previous.types.length > 0 &&
      types.length > 0 &&
      types.every((t) => !previous.types.includes(t))
    ) {
      add(
        "warning",
        joinPath(path, "@id"),
        `@id "${id}" is also defined at ${previous.path} (block ${previous.block + 1}) with a different @type (${previous.types.join(", ")}). Nodes with the same @id are merged.`,
      );
    }
    if (!previous)
      context.defined.set(id, { types, path, block: context.blockIndex });
    checkUrl(id, joinPath(path, "@id"), "@id", add, environment);
  }

  for (const t of types) {
    const rule = RULES[t];
    if (!rule) continue;
    const { required = [], oneOf = [], recommended = [] } = rule;
    for (const property of required) {
      if (isEmpty(node[property]))
        add("error", path, `${t}: missing required property "${property}".`);
    }
    for (const group of oneOf) {
      if (group.every((p) => isEmpty(node[p])))
        add(
          "error",
          path,
          `${t}: needs at least one of ${group.map((p) => `"${p}"`).join(", ")}.`,
        );
    }
    for (const property of recommended) {
      if (isEmpty(node[property]))
        add(
          "info",
          path,
          `${t}: recommended property "${property}" is missing.`,
        );
    }
  }
  if (types.includes("BreadcrumbList")) checkBreadcrumb(node, path, add);
  if (types.some((t) => ARTICLE.includes(t))) checkArticle(node, path, add);
  if (types.includes("Offer") && node.price !== undefined)
    checkPrice(node.price, joinPath(path, "price"), add);

  for (const key of keys) {
    if (key.startsWith("@")) continue;
    const v = node[key];
    const p = joinPath(path, key);
    if (v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
      add("warning", p, `"${key}" is empty — remove it or give it a value.`);
      continue;
    }
    const items: [unknown, string][] = Array.isArray(v)
      ? v.map((x, index) => [x, joinPath(p, index)])
      : [[v, p]];
    for (const [item, ip] of items) {
      if (typeof item === "string") checkString(item, ip, key, context);
      if (typeof item === "number" && !Number.isFinite(item))
        add("error", ip, `"${key}" is not a finite number.`);
    }
  }
}

function checkString(
  s: string,
  path: string,
  key: string,
  context: WalkContext,
) {
  const { add, environment } = context;
  const trimmed = s.trim();
  if (
    /^(undefined|null|NaN)$/.test(trimmed) ||
    (/\bundefined\b/.test(s) && /[/:]/.test(s)) ||
    s.includes("[object Object]")
  ) {
    add(
      "error",
      path,
      `"${key}" contains ${JSON.stringify(s.length > 80 ? s.slice(0, 80) + "…" : s)} — looks like a templating bug.`,
    );
    return;
  }
  if (trimmed === "") {
    add("warning", path, `"${key}" is blank.`);
    return;
  }
  if (
    s !== trimmed &&
    !["text", "description", "articleBody", "reviewBody"].includes(key)
  ) {
    add("info", path, `"${key}" has leading/trailing whitespace.`);
  }
  if (DATE_PROPS.has(key)) checkDate(s, path, key, add);
  if (URL_PROPS.has(key)) checkUrl(s, path, key, add, environment);
  if (
    ["name", "headline", "description"].includes(key) &&
    /<\/?[a-z][^>]*>/i.test(s)
  ) {
    add("warning", path, `"${key}" contains HTML tags — use plain text.`);
  }
  if (key === "headline" && s.length > 110) {
    add(
      "info",
      path,
      `headline is ${s.length} characters; Google may truncate long headlines.`,
    );
  }
  if ((key === "author" || key === "creator") && !/^https?:/.test(s)) {
    add(
      "warning",
      path,
      `"${key}" is a plain string. Google expects a Person or Organization object, e.g. { "@type": "Person", "name": "…", "url": "…" }.`,
    );
  }
}

function checkDate(s: string, path: string, key: string, add: Add) {
  if (key === "temporalCoverage") return;
  if (!ISO_DATE.test(s)) {
    add(
      "error",
      path,
      `"${key}" is "${s}" — not ISO 8601. Use e.g. "2026-10-19" or "2026-10-19T18:00:00+02:00" (date.toISOString()).`,
    );
    return;
  }
  if (s.includes("T") && !/(Z|[+-]\d{2}:?\d{2})$/.test(s)) {
    add(
      "info",
      path,
      `"${key}" has a time but no timezone; Google will assume Googlebot's timezone.`,
    );
  }
  if (Number.isNaN(Date.parse(s.length === 10 ? s + "T00:00:00Z" : s)))
    add("error", path, `"${key}" is not a real date.`);
}

function checkUrl(
  s: string,
  path: string,
  key: string,
  add: Add,
  environment: Environment,
) {
  if (key === "@id") {
    if (
      s.startsWith("#") ||
      s.startsWith("_:") ||
      /^[a-z][a-z0-9+.-]*:/i.test(s)
    ) {
      if (LOCALHOST.test(s))
        add(
          environment === "dev" ? "info" : "error",
          path,
          localhostMessage(s, environment),
        );
      return;
    }
    add(
      "info",
      path,
      `@id "${s}" is relative; it resolves against the page URL. An absolute URL or "#fragment" is clearer.`,
    );
    return;
  }
  if (/^data:/i.test(s)) {
    add(
      "warning",
      path,
      `"${key}" is a data: URI — Google needs a crawlable URL.`,
    );
    return;
  }
  if (!/^https?:\/\//i.test(s)) {
    if (/^\/\//.test(s))
      add(
        "warning",
        path,
        `"${key}" is protocol-relative ("${s}"). Use an absolute https:// URL.`,
      );
    else
      add(
        "error",
        path,
        `"${key}" is relative ("${s}"). Use an absolute URL — e.g. new URL("${s.startsWith("/") ? s : "/" + s}", Astro.site).href (needs \`site\` in astro.config).`,
      );
    return;
  }
  try {
    new URL(s);
  } catch {
    add("error", path, `"${key}" is not a valid URL: "${s}".`);
    return;
  }
  if (LOCALHOST.test(s))
    add(
      environment === "dev" ? "info" : "error",
      path,
      localhostMessage(s, environment),
    );
  else if (/^http:\/\//i.test(s))
    add("info", path, `"${key}" uses http:// — prefer https://.`);
}

function localhostMessage(s: string, environment: Environment) {
  return environment === "dev"
    ? `Points at localhost ("${s}"). Expected in dev if built from Astro.url; make sure production builds use Astro.site.`
    : `Points at localhost ("${s}") in the built output. Set \`site\` in astro.config and build URLs from Astro.site.`;
}

function checkBreadcrumb(node: JsonObject, path: string, add: Add) {
  const items = asArray(node.itemListElement);
  const lp = joinPath(path, "itemListElement");
  if (!Array.isArray(node.itemListElement) && items.length > 0)
    add("warning", lp, "itemListElement should be an array.");
  if (items.length === 1)
    add(
      "info",
      lp,
      "A breadcrumb with a single item is usually not shown by Google.",
    );
  for (const [index, it] of items.entries()) {
    const ip = joinPath(lp, index);
    if (!isObject(it)) {
      add("error", ip, "Breadcrumb item must be a ListItem object.");
      continue;
    }
    if (typeof it.position === "string" && /^\d+$/.test(it.position))
      add(
        "warning",
        joinPath(ip, "position"),
        `position is the string "${it.position}" — use a number.`,
      );
    const pos = Number(it.position);
    if (it.position !== undefined && pos !== index + 1)
      add(
        "warning",
        joinPath(ip, "position"),
        `position is ${JSON.stringify(it.position)}, expected ${index + 1} (1-based, in order).`,
      );
    const itemName = isObject(it.item) ? it.item.name : undefined;
    if (isEmpty(it.name) && isEmpty(itemName))
      add("error", ip, 'Breadcrumb ListItem: missing "name".');
    const isLast = index === items.length - 1;
    if (isEmpty(it.item) && !isLast)
      add(
        "error",
        ip,
        'Breadcrumb ListItem: missing "item" (URL). Only the last crumb may omit it.',
      );
  }
}

function checkArticle(node: JsonObject, path: string, add: Add) {
  for (const a of asArray(node.author)) {
    if (isObject(a) && isEmpty(a.name))
      add("warning", joinPath(path, "author"), 'author object has no "name".');
  }
  if (
    typeof node.datePublished === "string" &&
    typeof node.dateModified === "string"
  ) {
    const published = Date.parse(node.datePublished);
    const modified = Date.parse(node.dateModified);
    if (
      !Number.isNaN(published) &&
      !Number.isNaN(modified) &&
      modified < published
    )
      add(
        "warning",
        joinPath(path, "dateModified"),
        "dateModified is earlier than datePublished.",
      );
  }
}

function checkPrice(price: unknown, path: string, add: Add) {
  if (typeof price === "string" && !/^\d+(\.\d+)?$/.test(price)) {
    add(
      "error",
      path,
      `price "${price}" should be a number like 19.99 (no currency symbol, "." as decimal separator).`,
    );
  }
}
