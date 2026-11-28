import { createMiddleware } from "hono/factory";
import {
	SERVICE_TOKEN_HEADER,
	verifyServiceToken,
} from "../lib/service-token.js";

export type AppEnv = { Bindings: { SERVICE_JWT_SECRET?: string } };

// Rejects any request that doesn't carry a valid, unexpired service token.
// Uses its own header so the Authorization header stays free for the
// Organizer's Supabase session.
export const serviceAuth = createMiddleware<AppEnv>(async (c, next) => {
	const secret = c.env?.SERVICE_JWT_SECRET;
	if (!secret) {
		// Fail closed: a missing secret must never mean "allow everything".
		console.error("SERVICE_JWT_SECRET is not set");
		return c.json({ error: "Server misconfigured" }, 500);
	}

	const token = c.req.header(SERVICE_TOKEN_HEADER);
	if (!token) return c.json({ error: "Unauthorized" }, 401);

	try {
		await verifyServiceToken(token, secret);
	} catch {
		return c.json({ error: "Unauthorized" }, 401);
	}
	await next();
});
