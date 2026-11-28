import { sign, verify } from "hono/jwt";

// The edge Worker signs a token on every proxied request; the server verifies
// it. Both sides import this file so the header name, algorithm, issuer and
// audience cannot drift apart.
export const SERVICE_TOKEN_HEADER = "X-Service-Token";
const ALG = "HS256";
const ISSUER = "event-planner-edge";
const AUDIENCE = "event-planner-server";
const TTL_SECONDS = 60;

export function signServiceToken(secret: string): Promise<string> {
	const now = Math.floor(Date.now() / 1000);
	return sign(
		{ iss: ISSUER, aud: AUDIENCE, iat: now, exp: now + TTL_SECONDS },
		secret,
		ALG,
	);
}

export async function verifyServiceToken(
	token: string,
	secret: string,
): Promise<void> {
	await verify(token, secret, { alg: ALG, iss: ISSUER, aud: AUDIENCE });
}
