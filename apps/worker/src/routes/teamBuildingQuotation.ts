import {
	processTeamBuildingQuotationForm,
	teamBuildingQuotationFormBodySchema,
} from "@repo/services/contactForm/teamBuildingQuotation";
import { z } from "zod";

// eslint-disable-next-line unicorn/name-replacements -- cloudflare requirements for `env`
export async function teamBuildingQuotationRoute(request: Request, env: Env) {
	const parsedBody = teamBuildingQuotationFormBodySchema.safeParse(
		await request.json(),
	);

	if (!parsedBody.success) {
		return Response.json(
			{ error: "Invalid body", issues: z.treeifyError(parsedBody.error) },
			{ status: 400 },
		);
	}

	const { confirmationError } = await processTeamBuildingQuotationForm({
		body: parsedBody.data,
		zeptomailToken: env.ZOHO_API_KEY,
	});

	if (confirmationError) {
		console.error("client confirmation mail failed", confirmationError);
	}

	return Response.json({ ok: true });
}
