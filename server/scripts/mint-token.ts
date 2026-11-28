import { signServiceToken } from "../src/lib/service-token.js";

const secret = process.env.SERVICE_JWT_SECRET;
if (!secret) {
	console.error("SERVICE_JWT_SECRET must be set (e.g. in server/.env)");
	process.exit(1);
}

// Prints a 60-second token. Use it as the X-Service-Token header.
console.log(await signServiceToken(secret));
