import { Hono } from "hono";
import { type AppEnv, serviceAuth } from "./middleware/service-auth.js";
import { eventsRoute } from "./routes/events.js";
import { healthRoute } from "./routes/health.js";
import { registrationsRoute } from "./routes/registrations.js";

// Each .route() call mounts a router. Keep chaining so AppType includes every route.
const app = new Hono<AppEnv>()
	.use("/api/*", serviceAuth)
	.route("/api/health", healthRoute)
	.route("/api/events", eventsRoute)
	.route("/api/events/:eventId/registrations", registrationsRoute);

export type AppType = typeof app;
export default app;
