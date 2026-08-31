import type { Reference, SanityDocument, ValidationContext } from "sanity";

const API_VERSION = "2025-02-06";

type GetClient = ValidationContext["getClient"];

type Params = {
  /** the document type holding the pair, `venueGame` or `venueEvent` */
  documentType: string;
  /** the field pointing at the Format, `game` or `event` */
  field: string;
  document: SanityDocument | undefined;
  getClient: GetClient;
};

function refOf(document: SanityDocument | undefined, field: string) {
  return (document?.[field] as Reference | undefined)?._ref;
}

/** the published id, so a draft never counts itself as its own duplicate */
function publishedIdOf(document: SanityDocument | undefined) {
  return (document?._id ?? "").replace(/^drafts\./, "");
}

/**
 * The formats this venue already has a page for
 */
export async function takenFormatIds({
  documentType,
  field,
  document,
  getClient,
}: Params) {
  const venueRef = refOf(document, "venue");

  if (!venueRef) return [];

  // the field name is interpolated: GROQ takes a parameter for a value, never for an attribute
  return getClient({ apiVersion: API_VERSION }).fetch<string[]>(
    `*[_type == $documentType
      && venue._ref == $venueRef
      && !(_id in [$publishedId, "drafts." + $publishedId])].${field}._ref`,
    { documentType, venueRef, publishedId: publishedIdOf(document) },
  );
}

/**
 * a document drafted before its format was taken still has to be caught
 * and the reference filter only shapes what the search offers.
 */
export async function findDuplicate({
  documentType,
  field,
  document,
  getClient,
}: Params) {
  const venueRef = refOf(document, "venue");
  const formatRef = refOf(document, field);

  if (!venueRef || !formatRef) return null;

  return getClient({ apiVersion: API_VERSION }).fetch<{
    venueTitle: string | null;
    formatName: string | null;
  } | null>(
    `*[_type == $documentType
      && venue._ref == $venueRef
      && ${field}._ref == $formatRef
      && !(_id in [$publishedId, "drafts." + $publishedId])][0]{
      "venueTitle": venue->title,
      "formatName": ${field}->name
    }`,
    { documentType, venueRef, formatRef, publishedId: publishedIdOf(document) },
  );
}
