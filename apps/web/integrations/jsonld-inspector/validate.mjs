// JSON-LD validator — pure JS, no dependencies, no network.
// Runs both in the browser (dev toolbar app) and in Node (CLI / build hook).
//
// It checks:
//   • JSON syntax (with line/column) and HTML-escaped output
//   • @context / @type presence, likely @type typos
//   • Google rich-result required (error) and recommended (info) properties
//   • ISO 8601 dates, absolute URLs, localhost leaks
//   • templating leaks ("undefined", "[object Object]", "NaN"), empty values
//   • BreadcrumbList positions, dangling or conflicting @id references

/** @typedef {'error'|'warning'|'info'} Level */
/** @typedef {{ level: Level, path: string, message: string, block: number|null }} Issue */

// ---------------------------------------------------------------- vocabulary

const ARTICLE = ['Article', 'BlogPosting', 'NewsArticle', 'TechArticle', 'ScholarlyArticle', 'Report', 'SocialMediaPosting', 'LiveBlogPosting'];
const LOCAL_BUSINESS = ['LocalBusiness', 'Restaurant', 'Store', 'CafeOrCoffeeShop', 'Bakery', 'BarOrPub', 'Dentist', 'Hotel', 'MedicalClinic', 'ProfessionalService', 'LegalService', 'AutoRepair', 'HealthAndBeautyBusiness', 'SportsActivityLocation', 'LodgingBusiness', 'FoodEstablishment'];

/** Common schema.org types — used to catch typos like "Blogposting". */
const KNOWN_TYPES = new Set([
  'Thing', 'CreativeWork', 'WebSite', 'WebPage', 'AboutPage', 'ContactPage', 'CollectionPage', 'ProfilePage', 'FAQPage', 'QAPage', 'ItemPage', 'SearchResultsPage', 'CheckoutPage', 'MedicalWebPage', 'RealEstateListing',
  'WebPageElement', 'SiteNavigationElement', 'WPHeader', 'WPFooter', 'WPSideBar',
  ...ARTICLE, ...LOCAL_BUSINESS,
  'Organization', 'Corporation', 'EducationalOrganization', 'NGO', 'OnlineStore', 'OnlineBusiness', 'NewsMediaOrganization', 'Person',
  'PostalAddress', 'ContactPoint', 'GeoCoordinates', 'Place', 'VirtualLocation', 'OpeningHoursSpecification', 'Country', 'City',
  'BreadcrumbList', 'ItemList', 'ListItem', 'HowTo', 'HowToStep', 'HowToSection', 'HowToSupply', 'HowToTool',
  'ImageObject', 'VideoObject', 'AudioObject', 'MediaObject', 'Clip', 'SpeakableSpecification',
  'Product', 'ProductGroup', 'Offer', 'AggregateOffer', 'Brand', 'Review', 'Rating', 'AggregateRating', 'MerchantReturnPolicy', 'OfferShippingDetails', 'MonetaryAmount', 'QuantitativeValue', 'PriceSpecification', 'UnitPriceSpecification',
  'Event', 'MusicEvent', 'BusinessEvent', 'EducationEvent', 'SportsEvent', 'Festival', 'EventStatusType', 'EventAttendanceModeEnumeration',
  'Recipe', 'NutritionInformation', 'Question', 'Answer', 'Course', 'CourseInstance', 'JobPosting', 'SoftwareApplication', 'WebApplication', 'MobileApplication', 'SoftwareSourceCode',
  'Book', 'Movie', 'MusicRecording', 'MusicAlbum', 'MusicGroup', 'Podcast', 'PodcastSeries', 'PodcastEpisode', 'Dataset', 'DataDownload', 'DataCatalog', 'Collection',
  'SearchAction', 'EntryPoint', 'ReadAction', 'WatchAction', 'BuyAction', 'InteractionCounter', 'DefinedTerm', 'DefinedTermSet', 'Language', 'Duration', 'PropertyValue', 'Claim', 'ClaimReview', 'Comment', 'DiscussionForumPosting', 'EmployerAggregateRating', 'Occupation', 'Vehicle', 'Car',
]);
const KNOWN_LOWER = new Map([...KNOWN_TYPES].map((t) => [t.toLowerCase(), t]));

/**
 * Rules follow Google Search Central structured-data docs.
 * required → error (rich result won't be eligible). recommended → info.
 * oneOf → at least one of the listed properties must be present.
 */
const articleRule = { recommended: ['headline', 'image', 'datePublished', 'dateModified', 'author'] };
const businessRule = { required: ['name', 'address'], recommended: ['url', 'telephone', 'image', 'openingHoursSpecification', 'geo'] };
const RULES = {
  ...Object.fromEntries(ARTICLE.map((t) => [t, articleRule])),
  ...Object.fromEntries(LOCAL_BUSINESS.map((t) => [t, businessRule])),
  WebSite: { recommended: ['name', 'url'] },
  WebPage: { recommended: ['name', 'url'] },
  Organization: { recommended: ['name', 'url', 'logo'] },
  Person: { required: ['name'], recommended: ['url'] },
  BreadcrumbList: { required: ['itemListElement'] },
  ListItem: { required: ['position'] },
  FAQPage: { required: ['mainEntity'] },
  Question: { required: ['name', 'acceptedAnswer'] },
  Answer: { required: ['text'] },
  Product: { required: ['name'], oneOf: [['offers', 'review', 'aggregateRating']], recommended: ['image', 'description', 'brand', 'sku'] },
  Offer: { required: ['price', 'priceCurrency'], recommended: ['availability', 'url'] },
  AggregateOffer: { required: ['lowPrice', 'priceCurrency'], recommended: ['highPrice', 'offerCount'] },
  AggregateRating: { required: ['ratingValue'], oneOf: [['ratingCount', 'reviewCount']] },
  Review: { required: ['author', 'reviewRating'] },
  Rating: { required: ['ratingValue'] },
  Event: { required: ['name', 'startDate', 'location'], recommended: ['endDate', 'eventStatus', 'image', 'description', 'offers', 'organizer'] },
  Recipe: { required: ['name', 'image'], recommended: ['author', 'datePublished', 'description', 'recipeIngredient', 'recipeInstructions', 'totalTime'] },
  VideoObject: { required: ['name', 'thumbnailUrl', 'uploadDate'], recommended: ['description', 'duration', 'contentUrl', 'embedUrl'] },
  ImageObject: { oneOf: [['url', 'contentUrl']] },
  HowTo: { required: ['name', 'step'] },
  JobPosting: { required: ['title', 'description', 'datePosted', 'hiringOrganization'], recommended: ['validThrough', 'employmentType', 'jobLocation', 'baseSalary'] },
  SoftwareApplication: { required: ['name'], oneOf: [['offers'], ['aggregateRating', 'review']] },
  Course: { required: ['name', 'description'], recommended: ['provider'] },
  DiscussionForumPosting: { required: ['author', 'datePublished'], oneOf: [['text', 'image', 'video']] },
  PostalAddress: { recommended: ['streetAddress', 'addressLocality', 'postalCode', 'addressCountry'] },
  SearchAction: { required: ['target'] },
};

const DATE_PROPS = new Set(['datePublished', 'dateModified', 'dateCreated', 'datePosted', 'uploadDate', 'startDate', 'endDate', 'validFrom', 'validThrough', 'priceValidUntil', 'birthDate', 'deathDate', 'foundingDate', 'expires', 'availabilityStarts', 'availabilityEnds', 'temporalCoverage']);
const URL_PROPS = new Set(['url', 'logo', 'image', 'thumbnailUrl', 'contentUrl', 'embedUrl', 'sameAs', 'mainEntityOfPage', 'license', 'discussionUrl', 'item', 'urlTemplate', 'hasMap', 'downloadUrl', 'installUrl', 'thumbnail']);

const ISO_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(T([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d+)?)?(Z|[+-]([01]\d|2[0-3]):?[0-5]\d)?)?$/;
const LOCALHOST = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?(\/|$)/i;

// ---------------------------------------------------------------- helpers

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const asArray = (v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const isEmpty = (v) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0) || (isObj(v) && Object.keys(v).length === 0);

function stripPrefix(type) {
  if (typeof type !== 'string') return type;
  return type.replace(/^(https?:\/\/schema\.org\/|schema:)/i, '');
}

function joinPath(path, key) {
  if (typeof key === 'number') return `${path}[${key}]`;
  return /^[A-Za-z_$][\w$]*$/.test(key) ? `${path}.${key}` : `${path}["${key}"]`;
}

// ---------------------------------------------------------------- parsing

/**
 * Parse one <script type="application/ld+json"> body.
 * @returns {{ data?: any, error?: string, hint?: string }}
 */
export function parseBlock(raw) {
  const text = (raw ?? '').trim();
  if (!text) return { error: 'Empty JSON-LD block.' };

  let hint;
  if (/&quot;|&#34;|&#x22;/.test(text)) {
    hint = 'The JSON looks HTML-escaped. In Astro, render it with <script type="application/ld+json" set:html={JSON.stringify(data)} />.';
  }
  try {
    return { data: JSON.parse(text), hint };
  } catch (e) {
    let msg = String(e && e.message ? e.message : e);
    const m = /position (\d+)/.exec(msg);
    if (m && !/line \d+/.test(msg)) {
      const pos = Number(m[1]);
      const before = text.slice(0, pos);
      const line = before.split('\n').length;
      const col = pos - before.lastIndexOf('\n');
      msg += ` (line ${line}, column ${col})`;
    }
    const posMatch = /position (\d+)/.exec(msg);
    if (posMatch) {
      const p = Number(posMatch[1]);
      const snippet = text.slice(Math.max(0, p - 30), p + 30).replace(/\s+/g, ' ');
      msg += ` near: …${snippet}…`;
    }
    if (/,\s*[}\]]/.test(text)) hint = hint ?? 'There may be a trailing comma — JSON does not allow them.';
    return { error: msg, hint };
  }
}

// ---------------------------------------------------------------- validation

/**
 * Validate every JSON-LD block of one page.
 * @param {string[]} blocks raw script contents, in document order
 * @param {{ env?: 'dev'|'build' }} [options]
 */
export function validatePage(blocks, options = {}) {
  const env = options.env ?? 'build';
  /** @type {Issue[]} */
  const issues = [];
  const defined = new Map(); // @id → { types, path, block }
  const refs = []; // { id, path, block }
  const results = [];

  blocks.forEach((raw, blockIndex) => {
    const blockIssues = [];
    const add = (level, path, message) => {
      const issue = { level, path, message, block: blockIndex };
      blockIssues.push(issue);
      issues.push(issue);
    };
    const parsed = parseBlock(raw);
    if (parsed.hint) add(parsed.error ? 'info' : 'warning', '$', parsed.hint);
    if (parsed.error) {
      add('error', '$', `Invalid JSON: ${parsed.error}`);
      results.push({ index: blockIndex, raw, data: undefined, types: [], issues: blockIssues });
      return;
    }

    const data = parsed.data;
    const types = new Set();
    const ctx = { add, env, defined, refs, blockIndex, types };

    // Top-level shape & @context
    const roots = Array.isArray(data) ? data.map((d, i) => [d, `$[${i}]`]) : [[data, '$']];
    if (!Array.isArray(data) && !isObj(data)) add('error', '$', 'Top level must be an object or an array of objects.');
    for (const [root, path] of roots) {
      if (!isObj(root)) {
        add('error', path, 'Expected an object.');
        continue;
      }
      checkContext(root['@context'], path, add);
      walk(root, path, ctx, null, true);
    }
    results.push({ index: blockIndex, raw, data, types: [...types], issues: blockIssues });
  });

  // Cross-block @id checks
  for (const ref of refs) {
    if (ref.id.startsWith('_:')) continue;
    if (!defined.has(ref.id)) {
      const issue = { level: 'warning', path: ref.path, block: ref.block, message: `@id reference "${ref.id}" doesn't match any node on this page. Google only reads what's on the page, so this node is empty for it.` };
      issues.push(issue);
      results[ref.block]?.issues.push(issue);
    }
  }

  const order = { error: 0, warning: 1, info: 2 };
  for (const r of results) r.issues.sort((a, b) => order[a.level] - order[b.level]);
  const count = (lvl) => issues.filter((i) => i.level === lvl).length;
  return {
    blocks: results,
    issues,
    counts: { error: count('error'), warning: count('warning'), info: count('info') },
  };
}

function checkContext(context, path, add) {
  if (context === undefined) {
    add('error', path, 'Missing "@context". Use "https://schema.org".');
    return;
  }
  const values = asArray(context).filter((c) => typeof c === 'string');
  const objVocab = asArray(context).some((c) => isObj(c) && typeof c['@vocab'] === 'string' && /schema\.org/i.test(c['@vocab']));
  if (!objVocab && !values.some((c) => /^https?:\/\/schema\.org\/?$/i.test(c))) {
    add('warning', joinPath(path, '@context'), `"@context" is ${JSON.stringify(context)} — expected "https://schema.org".`);
  } else if (values.some((c) => /^http:\/\//i.test(c))) {
    add('info', joinPath(path, '@context'), '"http://schema.org" works, but "https://schema.org" is the current form.');
  }
}

function walk(value, path, ctx, parentKey, isRoot = false) {
  if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, joinPath(path, i), ctx, parentKey));
    return;
  }
  if (!isObj(value)) return;
  if ('@value' in value || '@list' in value) return;

  const keys = Object.keys(value).filter((k) => k !== '@context');
  const isGraphWrapper = isRoot && '@graph' in value && keys.every((k) => k === '@graph' || k === '@id');

  if (!isGraphWrapper) checkNode(value, path, ctx, parentKey, isRoot);

  for (const key of keys) {
    if (key === '@type' || key === '@id') continue;
    walk(value[key], joinPath(path, key), ctx, key);
  }
}

function checkNode(node, path, ctx, parentKey, isRoot) {
  const { add, env } = ctx;
  const keys = Object.keys(node).filter((k) => k !== '@context');

  // Pure reference: { "@id": "..." }
  if (keys.length === 1 && keys[0] === '@id') {
    if (typeof node['@id'] === 'string') ctx.refs.push({ id: node['@id'], path, block: ctx.blockIndex });
    return;
  }

  // @type
  const rawTypes = asArray(node['@type']);
  if (rawTypes.length === 0) {
    const where = parentKey ? ` (value of "${parentKey}")` : '';
    add(isRoot ? 'error' : 'warning', path, `Node has properties but no "@type"${where}.`);
  }
  const types = [];
  for (const t of rawTypes) {
    if (typeof t !== 'string' || !t) {
      add('error', joinPath(path, '@type'), `"@type" must be a non-empty string, got ${JSON.stringify(t)}.`);
      continue;
    }
    const clean = stripPrefix(t);
    types.push(clean);
    ctx.types.add(clean);
    if (!KNOWN_TYPES.has(clean)) {
      const fix = KNOWN_LOWER.get(clean.toLowerCase());
      if (fix) add('error', joinPath(path, '@type'), `Unknown type "${clean}" — did you mean "${fix}"? Types are case-sensitive.`);
      else add('info', joinPath(path, '@type'), `"${clean}" isn't in this tool's list of common types, so its spelling can't be checked offline.`);
    }
  }

  // @id definition
  if (typeof node['@id'] === 'string') {
    const id = node['@id'];
    const prev = ctx.defined.get(id);
    if (prev && prev.types.length && types.length && !types.some((t) => prev.types.includes(t))) {
      add('warning', joinPath(path, '@id'), `@id "${id}" is also defined at ${prev.path} (block ${prev.block + 1}) with a different @type (${prev.types.join(', ')}). Nodes with the same @id are merged.`);
    }
    if (!prev) ctx.defined.set(id, { types, path, block: ctx.blockIndex });
    checkUrl(id, joinPath(path, '@id'), '@id', add, env);
  }

  // Type rules
  for (const t of types) {
    const rule = RULES[t];
    if (!rule) continue;
    for (const prop of rule.required ?? []) {
      if (isEmpty(node[prop])) add('error', path, `${t}: missing required property "${prop}".`);
    }
    for (const group of rule.oneOf ?? []) {
      if (group.every((p) => isEmpty(node[p]))) add('error', path, `${t}: needs at least one of ${group.map((p) => `"${p}"`).join(', ')}.`);
    }
    for (const prop of rule.recommended ?? []) {
      if (isEmpty(node[prop])) add('info', path, `${t}: recommended property "${prop}" is missing.`);
    }
  }
  if (types.includes('BreadcrumbList')) checkBreadcrumb(node, path, add);
  if (types.some((t) => ARTICLE.includes(t))) checkArticle(node, path, add);
  if (types.includes('Offer') && node.price !== undefined) checkPrice(node.price, joinPath(path, 'price'), add);

  // Property values
  for (const key of keys) {
    if (key.startsWith('@')) continue;
    const v = node[key];
    const p = joinPath(path, key);
    if (v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
      add('warning', p, `"${key}" is empty — remove it or give it a value.`);
      continue;
    }
    for (const [item, ip] of Array.isArray(v) ? v.map((x, i) => [x, joinPath(p, i)]) : [[v, p]]) {
      if (typeof item === 'string') checkString(item, ip, key, ctx);
      if (typeof item === 'number' && !Number.isFinite(item)) add('error', ip, `"${key}" is not a finite number.`);
    }
  }
}

function checkString(s, path, key, ctx) {
  const { add, env } = ctx;
  const trimmed = s.trim();
  if (/^(undefined|null|NaN)$/.test(trimmed) || /\bundefined\b/.test(s) && /[/:]/.test(s) || s.includes('[object Object]')) {
    add('error', path, `"${key}" contains ${JSON.stringify(s.length > 80 ? s.slice(0, 80) + '…' : s)} — looks like a templating bug.`);
    return;
  }
  if (trimmed === '') {
    add('warning', path, `"${key}" is blank.`);
    return;
  }
  if (s !== trimmed && !['text', 'description', 'articleBody', 'reviewBody'].includes(key)) {
    add('info', path, `"${key}" has leading/trailing whitespace.`);
  }
  if (DATE_PROPS.has(key)) checkDate(s, path, key, add);
  if (URL_PROPS.has(key)) checkUrl(s, path, key, add, env);
  if (['name', 'headline', 'description'].includes(key) && /<\/?[a-z][^>]*>/i.test(s)) {
    add('warning', path, `"${key}" contains HTML tags — use plain text.`);
  }
  if (key === 'headline' && s.length > 110) {
    add('info', path, `headline is ${s.length} characters; Google may truncate long headlines.`);
  }
  if ((key === 'author' || key === 'creator') && !/^https?:/.test(s)) {
    add('warning', path, `"${key}" is a plain string. Google expects a Person or Organization object, e.g. { "@type": "Person", "name": "…", "url": "…" }.`);
  }
}

function checkDate(s, path, key, add) {
  if (key === 'temporalCoverage') return;
  if (!ISO_DATE.test(s)) {
    add('error', path, `"${key}" is "${s}" — not ISO 8601. Use e.g. "2026-10-19" or "2026-10-19T18:00:00+02:00" (date.toISOString()).`);
    return;
  }
  if (s.includes('T') && !/(Z|[+-]\d{2}:?\d{2})$/.test(s)) {
    add('info', path, `"${key}" has a time but no timezone; Google will assume Googlebot's timezone.`);
  }
  if (Number.isNaN(Date.parse(s.length === 10 ? s + 'T00:00:00Z' : s))) add('error', path, `"${key}" is not a real date.`);
}

function checkUrl(s, path, key, add, env) {
  if (key === '@id') {
    if (s.startsWith('#') || s.startsWith('_:') || /^[a-z][a-z0-9+.-]*:/i.test(s)) {
      if (LOCALHOST.test(s)) add(env === 'dev' ? 'info' : 'error', path, localhostMsg(s, env));
      return;
    }
    add('info', path, `@id "${s}" is relative; it resolves against the page URL. An absolute URL or "#fragment" is clearer.`);
    return;
  }
  if (/^data:/i.test(s)) {
    add('warning', path, `"${key}" is a data: URI — Google needs a crawlable URL.`);
    return;
  }
  if (!/^https?:\/\//i.test(s)) {
    if (/^\/\//.test(s)) add('warning', path, `"${key}" is protocol-relative ("${s}"). Use an absolute https:// URL.`);
    else add('error', path, `"${key}" is relative ("${s}"). Use an absolute URL — e.g. new URL("${s.startsWith('/') ? s : '/' + s}", Astro.site).href (needs \`site\` in astro.config).`);
    return;
  }
  try {
    new URL(s);
  } catch {
    add('error', path, `"${key}" is not a valid URL: "${s}".`);
    return;
  }
  if (LOCALHOST.test(s)) add(env === 'dev' ? 'info' : 'error', path, localhostMsg(s, env));
  else if (/^http:\/\//i.test(s)) add('info', path, `"${key}" uses http:// — prefer https://.`);
}

function localhostMsg(s, env) {
  return env === 'dev'
    ? `Points at localhost ("${s}"). Expected in dev if built from Astro.url; make sure production builds use Astro.site.`
    : `Points at localhost ("${s}") in the built output. Set \`site\` in astro.config and build URLs from Astro.site.`;
}

function checkBreadcrumb(node, path, add) {
  const items = asArray(node.itemListElement);
  const lp = joinPath(path, 'itemListElement');
  if (!Array.isArray(node.itemListElement) && items.length) add('warning', lp, 'itemListElement should be an array.');
  if (items.length === 1) add('info', lp, 'A breadcrumb with a single item is usually not shown by Google.');
  items.forEach((it, i) => {
    const ip = joinPath(lp, i);
    if (!isObj(it)) return add('error', ip, 'Breadcrumb item must be a ListItem object.');
    if (typeof it.position === 'string' && /^\d+$/.test(it.position)) add('warning', joinPath(ip, 'position'), `position is the string "${it.position}" — use a number.`);
    const pos = Number(it.position);
    if (it.position !== undefined && pos !== i + 1) add('warning', joinPath(ip, 'position'), `position is ${JSON.stringify(it.position)}, expected ${i + 1} (1-based, in order).`);
    const itemName = isObj(it.item) ? it.item.name : undefined;
    if (isEmpty(it.name) && isEmpty(itemName)) add('error', ip, 'Breadcrumb ListItem: missing "name".');
    const isLast = i === items.length - 1;
    if (isEmpty(it.item) && !isLast) add('error', ip, 'Breadcrumb ListItem: missing "item" (URL). Only the last crumb may omit it.');
  });
}

function checkArticle(node, path, add) {
  for (const a of asArray(node.author)) {
    if (isObj(a) && isEmpty(a.name)) add('warning', joinPath(path, 'author'), 'author object has no "name".');
  }
  if (typeof node.datePublished === 'string' && typeof node.dateModified === 'string') {
    const pub = Date.parse(node.datePublished), mod = Date.parse(node.dateModified);
    if (!Number.isNaN(pub) && !Number.isNaN(mod) && mod < pub) add('warning', joinPath(path, 'dateModified'), 'dateModified is earlier than datePublished.');
  }
}

function checkPrice(price, path, add) {
  if (typeof price === 'string' && !/^\d+(\.\d+)?$/.test(price)) {
    add('error', path, `price "${price}" should be a number like 19.99 (no currency symbol, "." as decimal separator).`);
  }
}
