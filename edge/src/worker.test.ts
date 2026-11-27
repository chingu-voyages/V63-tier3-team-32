import { describe, expect, it } from "vitest";
import {
	SERVICE_TOKEN_HEADER,
	verifyServiceToken,
} from "../../server/src/lib/service-token.js";
import worker from "./worker.js";

const SECRET = "test-secret-test-secret-test-secret";

const ACCESS_KEY_HEADER = "X-Access-Key";
const ACCESS_KEY = "test-access-key";
const authed = { [ACCESS_KEY_HEADER]: ACCESS_KEY };

// Stands in for the server Worker: records the request it was given.
function fakeApi() {
	const seen: Request[] = [];
	const API = {
		fetch: async (req: Request) => {
			seen.push(req);
			return new Response("ok");
		},
	} as unknown as Fetcher;
	return { seen, env: { API, SERVICE_JWT_SECRET: SECRET, ACCESS_KEY } };
}

type TestEnv = Omit<ReturnType<typeof fakeApi>["env"], "ACCESS_KEY"> & {
	ACCESS_KEY?: string;
};

const run = (req: Request, env: TestEnv) => worker.fetch(req as never, env);

describe("edge worker", () => {
	it("forwards /api requests with a valid service token", async () => {
		const { seen, env } = fakeApi();
		const res = await run(
			new Request("https://app.test/api/events", { headers: authed }),
			env,
		);

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
				headers: { ...authed, [SERVICE_TOKEN_HEADER]: "forged" },
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
				headers: { ...authed, Authorization: "Bearer organizer-session" },
			}),
			env,
		);
		expect(seen[0]?.method).toBe("POST");
		expect(await seen[0]?.text()).toBe('{"a":1}');
		expect(seen[0]?.headers.get("Authorization")).toBe(
			"Bearer organizer-session",
		);
	});

	it("rejects a missing access key without calling the server", async () => {
		const { seen, env } = fakeApi();
		const res = await run(new Request("https://app.test/api/events"), env);
		expect(res.status).toBe(401);
		expect(seen).toHaveLength(0);
	});

	it("rejects a wrong access key without calling the server", async () => {
		const { seen, env } = fakeApi();
		const res = await run(
			new Request("https://app.test/api/events", {
				headers: { [ACCESS_KEY_HEADER]: "wrong" },
			}),
			env,
		);
		expect(res.status).toBe(401);
		expect(seen).toHaveLength(0);
	});

	it("does not forward the access key to the server", async () => {
		const { seen, env } = fakeApi();
		await run(
			new Request("https://app.test/api/events", { headers: authed }),
			env,
		);
		expect(seen[0]?.headers.get(ACCESS_KEY_HEADER)).toBeNull();
	});

	it("fails closed when the service secret is not configured", async () => {
		const { seen, env } = fakeApi();
		const res = await run(
			new Request("https://app.test/api/events", { headers: authed }),
			{ ...env, SERVICE_JWT_SECRET: "" },
		);
		expect(res.status).toBe(500);
		expect(seen).toHaveLength(0);
	});

	it("fails closed when the access key is not configured", async () => {
		const { seen, env } = fakeApi();
		const res = await run(new Request("https://app.test/api/events"), {
			...env,
			ACCESS_KEY: undefined,
		});
		expect(res.status).toBe(500);
		expect(seen).toHaveLength(0);
	});
});
