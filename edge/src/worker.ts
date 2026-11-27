import {
	SERVICE_TOKEN_HEADER,
	signServiceToken,
} from "../../server/src/lib/service-token.js";

const ACCESS_KEY_HEADER = "X-Access-Key";

type Env = {
	API: Fetcher;
	SERVICE_JWT_SECRET: string;
	ACCESS_KEY?: string;
};

async function digest(value: string): Promise<Uint8Array> {
	const bytes = new TextEncoder().encode(value);
	return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
}

// Hashing first gives equal-length inputs, so the comparison leaks neither
// the key's content nor its length through timing.
async function keyMatches(given: string, expected: string): Promise<boolean> {
	const [a, b] = await Promise.all([digest(given), digest(expected)]);
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
	return diff === 0;
}

// Only /api/* reaches this Worker (assets.run_worker_first). Everything else
// is served straight from the static assets. Each API call must carry the
// shared Access Key, then is forwarded to the server with a fresh short-lived
// Service Token the browser never sees.
export default {
	async fetch(request, env): Promise<Response> {
		if (!env.ACCESS_KEY || !env.SERVICE_JWT_SECRET) {
			// Fail closed: a missing secret must never mean "allow everything".
			console.error("ACCESS_KEY and SERVICE_JWT_SECRET must both be set");
			return Response.json({ error: "Server misconfigured" }, { status: 500 });
		}
		const given = request.headers.get(ACCESS_KEY_HEADER);
		if (!given || !(await keyMatches(given, env.ACCESS_KEY))) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const headers = new Headers(request.headers);
		headers.delete(ACCESS_KEY_HEADER);
		// set() overwrites anything a client sent under this name.
		headers.set(
			SERVICE_TOKEN_HEADER,
			await signServiceToken(env.SERVICE_JWT_SECRET),
		);
		return env.API.fetch(new Request(request, { headers }));
	},
} satisfies ExportedHandler<Env>;
