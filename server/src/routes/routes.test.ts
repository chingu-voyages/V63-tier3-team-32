import { describe, expect, it } from "vitest";
import app from "../app.js";

describe("events", () => {
	it("lists events", async () => {
		const res = await app.request("/api/events");
		expect(res.status).toBe(200);
		expect(await res.json()).toHaveLength(2);
	});

	it("returns one event", async () => {
		const res = await app.request("/api/events/evt_1");
		expect(res.status).toBe(200);
		expect(await res.json()).toMatchObject({ id: "evt_1" });
	});

	it("404s for an unknown event", async () => {
		const res = await app.request("/api/events/nope");
		expect(res.status).toBe(404);
	});
});

describe("registrations", () => {
	it("lists registrations for an event", async () => {
		const res = await app.request("/api/events/evt_1/registrations");
		expect(res.status).toBe(200);
		expect(await res.json()).toHaveLength(2);
	});
});
