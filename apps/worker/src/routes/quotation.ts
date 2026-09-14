import {
	processQuotationForm,
	quotationFormBodySchema,
} from "@repo/services/contactForm/quotation";
import { z } from "zod";

// eslint-disable-next-line unicorn/name-replacements -- cloudflare requirements for `env`
export async function quotationRoute(request: Request, env: Env) {
	const parsedBody = quotationFormBodySchema.safeParse(await request.json());

	if (!parsedBody.success) {
		return Response.json(
			{ error: "Invalid body", issues: z.treeifyError(parsedBody.error) },
			{ status: 400 },
		);
	}

	const { confirmationError } = await processQuotationForm({
		body: parsedBody.data,
		zeptomailToken: env.ZOHO_API_KEY,
	});

	if (confirmationError) {
		console.error("client confirmation mail failed", confirmationError);
	}

	return Response.json({ ok: true });
}
