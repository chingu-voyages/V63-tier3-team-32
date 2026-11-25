import { Hono } from "hono";
import { z } from "zod";
import { getSupabaseClient } from "../lib/db.js";

export const healthSchema = z.object({ status: z.literal("ok") });

export const dbHealthSchema = z.discriminatedUnion("status", [
	z.object({ status: z.literal("ok"), db: z.literal("reachable") }),
	z.object({ status: z.literal("error"), db: z.literal("unreachable") }),
]);

// Mounted at /api/health in app.ts.
export const healthRoute = new Hono()
	// GET /api/health
	.get("/", (c) => c.json(healthSchema.parse({ status: "ok" })))
	// GET /api/health/db
	// There are no real tables yet, so this deliberately queries one that
	// cannot exist. Postgres error 42P01 ("relation does not exist") proves
	// the request reached the database through the Data API; any other
	// error (e.g. the Data API itself being unreachable) means it didn't.
	.get("/db", async (c) => {
		const { error } = await getSupabaseClient()
			.from("__connection_probe__")
			.select("*")
			.limit(1);

		if (!error || error.code === "42P01") {
			return c.json(dbHealthSchema.parse({ status: "ok", db: "reachable" }));
		}

		// Log the real error server-side only. Never echo raw driver/DB
		// error text (hosts, credentials in messages) to the caller.
		console.error("db-health check failed:", error);
		return c.json(
			dbHealthSchema.parse({ status: "error", db: "unreachable" }),
			503,
		);
	});
