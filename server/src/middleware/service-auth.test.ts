import { sign } from "hono/jwt";
import { describe, expect, it } from "vitest";
import app from "../app.js";
import {
	SERVICE_TOKEN_HEADER,
	signServiceToken,
} from "../lib/service-token.js";
import { TEST_SECRET } from "../test-helpers.js";

const env = { SERVICE_JWT_SECRET: TEST_SECRET };
const now = () => Math.floor(Date.now() / 1000);

function request(token?: string, e: object = env) {
	const headers = token ? { [SERVICE_TOKEN_HEADER]: token } : undefined;
	return app.request("/api/health", { headers }, e);
}

describe("service auth", () => {
	it("accepts a valid token", async () => {
		const res = await request(await signServiceToken(TEST_SECRET));
		expect(res.status).toBe(200);
	});

	it("rejects a missing token", async () => {
		expect((await request()).status).toBe(401);
	});

	it("rejects garbage", async () => {
		expect((await request("not-a-jwt")).status).toBe(401);
	});

	it("rejects a token signed with another secret", async () => {
		const res = await request(
			await signServiceToken("other-secret-other-secret-other"),
		);
		expect(res.status).toBe(401);
	});

	it("rejects an expired token", async () => {
		const token = await sign(
			{
				iss: "event-planner-edge",
				aud: "event-planner-server",
				iat: now() - 120,
				exp: now() - 60,
			},
			TEST_SECRET,
			"HS256",
		);
		expect((await request(token)).status).toBe(401);
	});

	it("rejects a token for another audience", async () => {
		const token = await sign(
			{
				iss: "event-planner-edge",
				aud: "someone-else",
				iat: now(),
				exp: now() + 60,
			},
			TEST_SECRET,
			"HS256",
		);
		expect((await request(token)).status).toBe(401);
	});

	it("rejects an unsigned (alg none) token", async () => {
		const b64 = (o: object) =>
			Buffer.from(JSON.stringify(o)).toString("base64url");
		const token = `${b64({ alg: "none", typ: "JWT" })}.${b64({ iss: "event-planner-edge", aud: "event-planner-server", exp: now() + 60 })}.`;
		expect((await request(token)).status).toBe(401);
	});

	it("fails closed when the secret is not configured", async () => {
		const res = await request(await signServiceToken(TEST_SECRET), {});
		expect(res.status).toBe(500);
	});
});
