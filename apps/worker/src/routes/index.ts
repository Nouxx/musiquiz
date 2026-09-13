import { clientContactRoute } from "./clientContact";
import { teamBuildingQuotationRoute } from "./teamBuildingQuotation";

// eslint-disable-next-line unicorn/name-replacements -- cloudflare requirements for `env`
type RouteHandler = (request: Request, env: Env) => Promise<Response>;

export const routes: Record<string, RouteHandler> = {
	"/form/client-contact": clientContactRoute,
	"/form/team-building-quotation": teamBuildingQuotationRoute,
};
