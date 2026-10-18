import {
  fetchPlaceInfo,
  type GooglePlaceInfo,
} from "@repo/api/google/fetchPlaceInfo";

export type VenueReviews = {
  averageRating: number;
  reviewsCount: number;
};

function toVenueReviews(input: GooglePlaceInfo): VenueReviews | undefined {
  const { rating, userRatingCount } = input;

  // a place id can have no review
  if (!rating || !userRatingCount) return;

  return {
    averageRating: rating,
    reviewsCount: userRatingCount,
  };
}

// each call is billed; holding the promise lets concurrent renders share one in-flight request
const cache = new Map<string, Promise<VenueReviews | undefined>>();

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
