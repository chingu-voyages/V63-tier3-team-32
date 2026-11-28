import app from "./app.js";
import { SERVICE_TOKEN_HEADER, signServiceToken } from "./lib/service-token.js";

export const TEST_SECRET = "test-secret-test-secret-test-secret";

// Sends a request with a valid service token, like the edge Worker would.
export async function authedRequest(path: string, init: RequestInit = {}) {
	const headers = new Headers(init.headers);
	headers.set(SERVICE_TOKEN_HEADER, await signServiceToken(TEST_SECRET));
	return app.request(
		path,
		{ ...init, headers },
		{ SERVICE_JWT_SECRET: TEST_SECRET },
	);
}
