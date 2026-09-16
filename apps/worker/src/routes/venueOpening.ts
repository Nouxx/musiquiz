import {
	processVenueOpeningForm,
	venueOpeningFormBodySchema,
} from "@repo/services/contactForm/venueOpening";
import { z } from "zod";

// eslint-disable-next-line unicorn/name-replacements -- cloudflare requirements for `env`
export async function venueOpeningRoute(request: Request, env: Env) {
	const parsedBody = venueOpeningFormBodySchema.safeParse(
		await request.json(),
	);

	if (!parsedBody.success) {
		return Response.json(
			{ error: "Invalid body", issues: z.treeifyError(parsedBody.error) },
			{ status: 400 },
		);
	}

	const { confirmationError } = await processVenueOpeningForm({
		body: parsedBody.data,
		zeptomailToken: env.ZOHO_API_KEY,
	});

	if (confirmationError) {
		console.error("applicant confirmation mail failed", confirmationError);
	}

	return Response.json({ ok: true });
}
