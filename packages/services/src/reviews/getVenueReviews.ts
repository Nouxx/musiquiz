import {
  fetchPlaceInfo,
  type GooglePlaceInfo,
} from "@repo/api/google/fetchPlaceInfo";

export type VenueReviews = {
  averageRating: number;
  reviewsCount: number;
};

function toVenueReviews(input: GooglePlaceInfo): VenueReviews {
  const { rating, userRatingCount, id } = input;

  if (!rating) {
    throw new Error(`Missing rating for place id ${id}`);
  }

  if (!userRatingCount) {
    throw new Error(`Missing userRatingCount for place id ${id}`);
  }

  return {
    averageRating: rating,
    reviewsCount: userRatingCount,
  };
}

// every article about a venue asks for the same place, and each call is billed
const cache = new Map<string, Promise<VenueReviews>>();

async function fetchVenueReviews({
  venueGooglePlaceId,
  googleApiKey,
}: {
  venueGooglePlaceId: string;
  googleApiKey: string;
}) {
  try {
    const data = await fetchPlaceInfo({
      placeId: venueGooglePlaceId,
      apiKey: googleApiKey,
    });

    return toVenueReviews(data);
  } catch (error) {
    // a long-lived ssr isolate would otherwise replay one failure forever
    cache.delete(venueGooglePlaceId);
    throw error;
  }
}

export async function getVenueReviews(input: {
  venueGooglePlaceId: string;
  googleApiKey: string;
}) {
  const cached = cache.get(input.venueGooglePlaceId);
  if (cached) return cached;

  const reviews = fetchVenueReviews(input);
  cache.set(input.venueGooglePlaceId, reviews);
  return reviews;
}
