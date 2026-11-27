import {
	SERVICE_TOKEN_HEADER,
	signServiceToken,
} from "../../server/src/lib/service-token.js";

type Env = {
	API: Fetcher;
	SERVICE_JWT_SECRET: string;
};

// Only /api/* reaches this Worker (assets.run_worker_first). Everything else
// is served straight from the static assets. Each API call is forwarded to the
// server with a fresh short-lived token the browser never sees.
export default {
	async fetch(request, env): Promise<Response> {
		const headers = new Headers(request.headers);
		// set() overwrites anything a client sent under this name.
		headers.set(
			SERVICE_TOKEN_HEADER,
			await signServiceToken(env.SERVICE_JWT_SECRET),
		);
		return env.API.fetch(new Request(request, { headers }));
	},
} satisfies ExportedHandler<Env>;
