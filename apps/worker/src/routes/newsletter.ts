import { buildBrevoApiKeyName } from "@repo/services/form/buildBrevoApiKeyName";
import {
	newsletterFormBodySchema,
	processNewsletterForm,
} from "@repo/services/form/newsletter";
import { z } from "zod";

// eslint-disable-next-line unicorn/name-replacements -- cloudflare requirements for `env`
function readVenueSecret(env: Env, name: string) {
	// one secret per venue, added in the dashboard without a code change, so `Env` never lists it
	const value: unknown = (env as unknown as Record<string, unknown>)[name];
	return typeof value === "string" && value !== "" ? value : undefined;
}

// eslint-disable-next-line unicorn/name-replacements -- cloudflare requirements for `env`
export async function newsletterRoute(request: Request, env: Env) {
	const parsedBody = newsletterFormBodySchema.safeParse(await request.json());

	if (!parsedBody.success) {
		return Response.json(
			{ error: "Invalid body", issues: z.treeifyError(parsedBody.error) },
			{ status: 400 },
		);
	}

	const { brevoError } = await processNewsletterForm({
		body: parsedBody.data,
		brevoApiKey: readVenueSecret(
			env,
			buildBrevoApiKeyName(parsedBody.data.venueSlug),
		),
		zeptomailToken: env.ZOHO_API_KEY,
		sanityConfig: {
			projectId: env.SANITY_PROJECT_ID,
			dataset: env.SANITY_DATASET,
			draft: false,
		},
	});

	if (brevoError) {
		console.error("brevo sign-up failed, mailed the owners", brevoError);
	}

	return Response.json({ ok: true });
}
