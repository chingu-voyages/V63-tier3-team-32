import { describe, expect, it } from "vitest";
import {
	SERVICE_TOKEN_HEADER,
	verifyServiceToken,
} from "../../server/src/lib/service-token.js";
import worker from "./worker.js";

const SECRET = "test-secret-test-secret-test-secret";

// Stands in for the server Worker: records the request it was given.
function fakeApi() {
	const seen: Request[] = [];
	const API = {
		fetch: async (req: Request) => {
			seen.push(req);
			return new Response("ok");
		},
	} as unknown as Fetcher;
	return { seen, env: { API, SERVICE_JWT_SECRET: SECRET } };
}

const run = (req: Request, env: ReturnType<typeof fakeApi>["env"]) =>
	worker.fetch(req as never, env);

describe("edge worker", () => {
	it("forwards /api requests with a valid service token", async () => {
		const { seen, env } = fakeApi();
		const res = await run(new Request("https://app.test/api/events"), env);

		expect(res.status).toBe(200);
		expect(seen[0]?.url).toBe("https://app.test/api/events");
		const token = seen[0]?.headers.get(SERVICE_TOKEN_HEADER);
		expect(token).toBeTruthy();
		await expect(
			verifyServiceToken(token as string, SECRET),
		).resolves.toBeUndefined();
	});

	it("overwrites a token supplied by the client", async () => {
		const { seen, env } = fakeApi();
		await run(
			new Request("https://app.test/api/events", {
				headers: { [SERVICE_TOKEN_HEADER]: "forged" },
			}),
			env,
		);
		expect(seen[0]?.headers.get(SERVICE_TOKEN_HEADER)).not.toBe("forged");
	});

	it("keeps method, body and Authorization intact", async () => {
		const { seen, env } = fakeApi();
		await run(
			new Request("https://app.test/api/events", {
				method: "POST",
				body: JSON.stringify({ a: 1 }),
				headers: { Authorization: "Bearer organizer-session" },
			}),
			env,
		);
		expect(seen[0]?.method).toBe("POST");
		expect(await seen[0]?.text()).toBe('{"a":1}');
		expect(seen[0]?.headers.get("Authorization")).toBe(
			"Bearer organizer-session",
		);
	});
});
