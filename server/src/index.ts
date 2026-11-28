import { serve } from "@hono/node-server";
import app from "./app.js";

const port = Number(process.env.PORT ?? 3000);

// Pass process.env as the bindings so the node server sees the same
// SERVICE_JWT_SECRET that the Worker gets from its secrets.
serve({ fetch: (req) => app.fetch(req, process.env), port }, (info) => {
	console.log(`server listening on http://localhost:${info.port}`);
});
