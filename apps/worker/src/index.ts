const ALLOWED_ORIGINS = new Set(['http://localhost:4321', 'http://localhost:4322']);

// todo: add prod origins, find a way to configure it properly, checks for best practices
function corsHeaders(request: Request): Record<string, string> {
	const origin = request.headers.get('Origin');
	if (!origin || !ALLOWED_ORIGINS.has(origin)) return {};

	return {
		'Access-Control-Allow-Origin': origin,
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Max-Age': '86400',
		// the response differs per origin, so a shared cache must key on it
		Vary: 'Origin',
	};
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: corsHeaders(request) });
		}

		return new Response('Hello Musiquiz!', { headers: corsHeaders(request) });
	},
} satisfies ExportedHandler<Env>;
