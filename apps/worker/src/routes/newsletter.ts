import { newsletterFormBodySchema } from "@repo/services/form/newsletter";
import { z } from "zod";

export async function newsletterRoute(request: Request) {
	const parsedBody = newsletterFormBodySchema.safeParse(await request.json());

	if (!parsedBody.success) {
		return Response.json(
			{ error: "Invalid body", issues: z.treeifyError(parsedBody.error) },
			{ status: 400 },
		);
	}

	return Response.json({ ok: true });
}
