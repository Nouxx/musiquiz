// Published venues missing a published page their routes need. Read-only.
import { query } from "./lib.mjs";

const venues = await query(`*[_type == "venue" && !(_id in path("drafts.**"))]{
  _id,
  "slug": slug.current,
  "required": ["home"]
    + select(bookingProvider == "4escape" => ["book"], [])
    + select(giftingProvider == "4escape" => ["gift"], []),
  "published": *[_type == "venuePage" && venue._ref == ^._id
    && !(_id in path("drafts.**"))].pageType
}`);

const unfinished = venues
  .map((venue) => ({
    ...venue,
    missing: venue.required.filter((type) => !venue.published.includes(type)),
  }))
  .filter((venue) => venue.missing.length);

for (const venue of unfinished) {
  console.log(
    `${venue._id}  ${venue.slug}  missing: ${venue.missing.join(", ")}`,
  );
}

console.log(
  unfinished.length
    ? `\n${unfinished.length} unfinished. Ids: ${unfinished.map((venue) => venue._id).join(" ")}`
    : "No unfinished venue.",
);
