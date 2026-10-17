import { z } from "zod";

const googlePlaceInfoSchema = z.strictObject({
  id: z.string(),
  rating: z.number().optional(),
  userRatingCount: z.number().int().optional(),
});

export type GooglePlaceInfo = z.infer<typeof googlePlaceInfoSchema>;

function buildUrl({ placeId }: { placeId: string }) {
  return new URL(`https://places.googleapis.com/v1/places/${placeId}`);
}

function buildHeaders({ apiKey }: { apiKey: string }) {
  return {
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask": "id,rating,userRatingCount",
    "Content-Type": "application/json",
  };
}

/**
 * https://developers.google.com/maps/documentation/places/web-service/place-details
 */
export async function fetchPlaceInfo({
  placeId,
  apiKey,
}: {
  placeId: string;
  apiKey: string;
}) {
  const url = buildUrl({ placeId });

  const response = await fetch(url, {
    headers: buildHeaders({ apiKey }),
  });

  if (!response.ok) {
    throw new Error(
      `Google Places rejected: ${response.status} ${await response.text()}`,
    );
  }

  return googlePlaceInfoSchema.parse(await response.json());
}
