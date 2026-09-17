import { clientContactRoute } from "./clientContact";
import { quotationRoute } from "./quotation";
import { venueOpeningRoute } from "./venueOpening";

// eslint-disable-next-line unicorn/name-replacements -- cloudflare requirements for `env`
type RouteHandler = (request: Request, env: Env) => Promise<Response>;

export const routes: Record<string, RouteHandler> = {
	"/form/client-contact": clientContactRoute,
	"/form/quotation": quotationRoute,
	"/form/venue-opening": venueOpeningRoute,
};
