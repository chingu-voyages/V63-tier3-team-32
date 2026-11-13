import { Hono } from "hono";
import { z } from "zod";
import { eventsRoute } from "./routes/events.js";
import { registrationsRoute } from "./routes/registrations.js";

export const healthSchema = z.object({ status: z.literal("ok") });

// Each .route() call mounts a router. Keep chaining so AppType includes every route.
const app = new Hono()
	.get("/api/health", (c) => c.json(healthSchema.parse({ status: "ok" })))
	.route("/api/events", eventsRoute)
	.route("/api/events/:eventId/registrations", registrationsRoute);

export type AppType = typeof app;
export default app;
