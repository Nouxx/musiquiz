import { routes } from "./routes";

const ALLOWED_ORIGINS = new Set([
	"http://localhost:4321",
	"http://localhost:4322",
	"https://musiquiz-static.clement-vnnq.workers.dev",
	"https://musiquiz-ssr.clement-vnnq.workers.dev",
]);

function corsHeaders(request: Request): Record<string, string> {
	const origin = request.headers.get("Origin");

	if (!origin || !ALLOWED_ORIGINS.has(origin)) {
		// returning systematically the Vary: Origin header prevents cache poisoning attacks
		// https://security.stackexchange.com/a/151596
		return { Vary: "Origin" };
	}

	return {
		"Access-Control-Allow-Origin": origin,
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Max-Age": "86400",
		Vary: "Origin",
	};
}

function withCors(response: Response, request: Request) {
	const headers = Object.entries(corsHeaders(request));
	for (const [key, value] of headers) {
		response.headers.set(key, value);
	}
	return response;
}

export default {
	// eslint-disable-next-line unicorn/name-replacements -- cloudflare requirement
	async fetch(request, env): Promise<Response> {
		if (request.method === "OPTIONS") {
			return new Response(undefined, {
				status: 204,
				headers: corsHeaders(request),
			});
		}

		const { pathname } = new URL(request.url);
		const route = routes[pathname];

		if (!route) {
			return withCors(
				Response.json({ error: "Not found" }, { status: 404 }),
				request,
			);
		}

		if (request.method !== "POST") {
			return withCors(
				Response.json(
					{ error: "Method not allowed" },
					{ status: 405, headers: { Allow: "POST" } },
				),
				request,
			);
		}

		try {
			return withCors(await route(request, env), request);
		} catch (error) {
			console.error(pathname, error);
			return withCors(
				Response.json({ error: "Internal error" }, { status: 500 }),
				request,
			);
		}
	},
} satisfies ExportedHandler<Env>;
