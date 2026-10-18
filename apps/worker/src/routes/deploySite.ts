import { SANITY_API_VERSION } from "@repo/utils/sanityConfig";
import { z } from "zod";

// a viewer can read drafts but has nothing to publish
const DEPLOYER_ROLES = new Set(["administrator", "editor", "developer"]);

const roleSchema = z.object({ name: z.string() });

const sanityUserSchema = z.object({
	id: z.string(),
	roles: z.array(roleSchema),
});

const deployHookResponseSchema = z.object({
	result: z.object({
		build_uuid: z.string(),
		already_exists: z.boolean().optional(),
	}),
});

// eslint-disable-next-line unicorn/name-replacements -- cloudflare requirements for `env`
async function getSanityUser(token: string, env: Env) {
	const response = await fetch(
		`https://${env.SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/users/me`,
		{ headers: { Authorization: `Bearer ${token}` } },
	);

	if (!response.ok) return;

	// an anonymous or foreign token gets 200 with `{}`
	const user = sanityUserSchema.safeParse(await response.json());
	return user.success ? user.data : undefined;
}

// eslint-disable-next-line unicorn/name-replacements -- cloudflare requirements for `env`
export async function deploySiteRoute(request: Request, env: Env) {
	const token = request.headers
		.get("Authorization")
		?.match(/^Bearer (.+)$/)?.[1];

	const user = token ? await getSanityUser(token, env) : undefined;

	if (!user) {
		return Response.json({ error: "Not signed in" }, { status: 401 });
	}

	if (user.roles.every((role) => !DEPLOYER_ROLES.has(role.name))) {
		return Response.json({ error: "Not allowed to deploy" }, { status: 403 });
	}

	// no cooldown: Cloudflare queues at most one build behind a running one and
	// merges later clicks into it, see README "Creating the deploy hook"
	const hookResponse = await fetch(env.STATIC_DEPLOY_HOOK_URL, {
		method: "POST",
	});

	if (!hookResponse.ok) {
		console.error(
			"deploy hook failed",
			hookResponse.status,
			await hookResponse.text(),
		);
		return Response.json({ error: "Deploy hook failed" }, { status: 502 });
	}

	const { result } = deployHookResponseSchema.parse(await hookResponse.json());

	console.log("site deploy triggered", user.id, result.build_uuid);

	return Response.json({
		buildId: result.build_uuid,
		alreadyQueued: result.already_exists ?? false,
	});
}
