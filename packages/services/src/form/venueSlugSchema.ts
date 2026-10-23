import z from "zod";

// buildVenueEmail turns this into the mailbox the enquiry is sent to, so a
// slug that is anything but a bare slug lets the request pick the recipient
export const venueSlugSchema = z
  .string()
  .max(40)
  .regex(/^[a-z][a-z0-9-]*$/);
