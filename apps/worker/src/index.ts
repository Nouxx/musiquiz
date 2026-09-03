import { sendEmail } from "@repo/api/zeptomail/sendEmail";

const ALLOWED_ORIGINS = new Set([
	"http://localhost:4321",
	"http://localhost:4322",
]);

// todo: add prod origins, find a way to configure it properly, checks for best practices
function corsHeaders(request: Request): Record<string, string> {
	const origin = request.headers.get("Origin");
	if (!origin || !ALLOWED_ORIGINS.has(origin)) return {};

	return {
		"Access-Control-Allow-Origin": origin,
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Max-Age": "86400",
		// the response differs per origin, so a shared cache must key on it
		Vary: "Origin",
	};
}

type ClientContactFormData = {
	venueSlug: string;
	firstName: string;
	mail: string;
	phone: string;
	message: string;
};

export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: corsHeaders(request) });
		}

		// todo: rename
		const zeptomailToken = env.ZOHO_API_KEY;

		const { venueSlug, firstName, mail, phone, message } =
			await request.json<ClientContactFormData>();

		const response = await sendEmail({
			venueSlug,
			firstName,
			mail,
			phone,
			message,
			token: zeptomailToken,
		});

		for (const [key, value] of Object.entries(corsHeaders(request))) {
			response.headers.set(key, value);
		}

		return response;
	},
} satisfies ExportedHandler<Env>;
