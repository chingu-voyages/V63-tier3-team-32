import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabaseClient } from "./lib/db.js";
import { authedRequest } from "./test-helpers.js";

// Mocked so the test controls both outcomes directly, instead of depending
// on a live Supabase project (or its Data API being enabled) in the test
// environment. vi.mock is hoisted above the imports above, so app.js
// already sees the mock.
vi.mock("./lib/db.js", () => ({ getSupabaseClient: vi.fn() }));

// Builds a fake client whose from().select().limit() chain resolves with
// the given error (or none), matching the shape health.ts actually calls.
function fakeSupabaseClient(error: { code: string; message: string } | null) {
	return {
		from: () => ({
			select: () => ({
				limit: () => Promise.resolve({ data: null, error }),
			}),
		}),
	} as unknown as ReturnType<typeof getSupabaseClient>;
}

describe("GET /api/health", () => {
	it("returns ok", async () => {
		const res = await authedRequest("/api/health");
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ status: "ok" });
	});
});

describe("GET /api/health/db", () => {
	afterEach(() => {
		vi.mocked(getSupabaseClient).mockReset();
	});

	it("returns ok when the database responds with no error", async () => {
		vi.mocked(getSupabaseClient).mockReturnValue(fakeSupabaseClient(null));

		const res = await authedRequest("/api/health/db");

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ status: "ok", db: "reachable" });
	});

	it("still returns ok when the probe table doesn't exist (42P01)", async () => {
		// The probe table is deliberately nonexistent. This error proves the
		// request reached Postgres through the Data API, so it still counts
		// as "reachable".
		vi.mocked(getSupabaseClient).mockReturnValue(
			fakeSupabaseClient({
				code: "42P01",
				message: 'relation "__connection_probe__" does not exist',
			}),
		);

		const res = await authedRequest("/api/health/db");

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ status: "ok", db: "reachable" });
	});

	it("returns 503 when the database is unreachable", async () => {
		// PGRST002: the Data API couldn't reach Postgres at all (e.g. the
		// project is paused or the Data API is disabled) -- a real failure.
		vi.mocked(getSupabaseClient).mockReturnValue(
			fakeSupabaseClient({
				code: "PGRST002",
				message: "Could not query the database for the schema cache",
			}),
		);

		const res = await authedRequest("/api/health/db");

		expect(res.status).toBe(503);
		expect(await res.json()).toEqual({ status: "error", db: "unreachable" });
	});
});
