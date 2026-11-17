import { afterEach, describe, expect, it, vi } from "vitest";
import app from "./app.js";
import { getDBClient } from "./lib/db.js";

// Mocked so the test controls both outcomes directly, instead of depending
// on whatever DATABASE_URL happens to be set (or not) in the test environment.
// vi.mock is hoisted above the imports above, so app.js already sees the mock.
vi.mock("./lib/db.js", () => ({ getDBClient: vi.fn() }));

describe("GET /api/health", () => {
	it("returns ok", async () => {
		const res = await app.request("/api/health");
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ status: "ok" });
	});
});

describe("GET /api/health/db", () => {
	afterEach(() => {
		vi.mocked(getDBClient).mockReset();
	});

	it("returns ok when the database responds", async () => {
		vi.mocked(getDBClient).mockReturnValue((() =>
			Promise.resolve([{ one: 1 }])) as unknown as ReturnType<
			typeof getDBClient
		>);

		const res = await app.request("/api/health/db");

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ status: "ok", db: "reachable" });
	});

	it("returns 503 when the database is unreachable", async () => {
		vi.mocked(getDBClient).mockReturnValue((() => {
			throw new Error("connect ETIMEDOUT");
		}) as unknown as ReturnType<typeof getDBClient>);

		const res = await app.request("/api/health/db");

		expect(res.status).toBe(503);
		expect(await res.json()).toEqual({ status: "error", db: "unreachable" });
	});
});
