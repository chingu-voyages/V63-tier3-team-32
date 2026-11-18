import { Hono } from "hono";
import { z } from "zod";
import { getDBClient } from "../lib/db.js";

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
	// SELECT 1 needs no tables: a successful round trip proves the
	// connection string, network, and database are all working.
	.get("/db", async (c) => {
		try {
			await getDBClient()`select 1`;
			return c.json(dbHealthSchema.parse({ status: "ok", db: "reachable" }));
		} catch (err) {
			// Log the real error server-side only. Never echo raw driver/DB
			// error text (hosts, credentials in messages) to the caller.
			console.error("db-health check failed:", err);
			return c.json(
				dbHealthSchema.parse({ status: "error", db: "unreachable" }),
				503,
			);
		}
	});
