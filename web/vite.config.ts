import react from "@vitejs/plugin-react";
import { loadEnv, type Plugin } from "vite";
import { defineConfig } from "vitest/config";
import {
	SERVICE_TOKEN_HEADER,
	signServiceToken,
} from "../server/src/lib/service-token.js";

// Dev stand-in for the edge Worker: the Vite proxy talks straight to the Node
// server, so sign the same service token the Worker would. Dev server only;
// nothing here reaches the browser bundle.
function devServiceToken(secret: string | undefined): Plugin {
	return {
		name: "dev-service-token",
		apply: "serve",
		configureServer(server) {
			server.middlewares.use("/api", async (req, _res, next) => {
				// Checked per request, not at startup, so tests and builds that
				// never call the API don't need the secret.
				if (!secret) {
					return next(
						new Error("SERVICE_JWT_SECRET must be set in server/.env"),
					);
				}
				// Overwrites anything the client sent under this name.
				req.headers[SERVICE_TOKEN_HEADER.toLowerCase()] =
					await signServiceToken(secret);
				next();
			});
		},
	};
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, "../server", "");
	return {
		plugins: [react(), devServiceToken(env.SERVICE_JWT_SECRET)],
		server: {
			proxy: { "/api": "http://localhost:3000" },
		},
		test: {
			environment: "happy-dom",
			globals: false,
		},
	};
});
