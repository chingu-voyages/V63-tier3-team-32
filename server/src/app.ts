import { Hono } from "hono";
import { eventsRoute } from "./routes/events.js";
import { healthRoute } from "./routes/health.js";
import { registrationsRoute } from "./routes/registrations.js";

// Each .route() call mounts a router. Keep chaining so AppType includes every route.
const app = new Hono()
	.route("/api/health", healthRoute)
	.route("/api/events", eventsRoute)
	.route("/api/events/:eventId/registrations", registrationsRoute);

export type AppType = typeof app;
export default app;
