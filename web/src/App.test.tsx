import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";

const { json } = vi.hoisted(() => ({
	json: (body: unknown) => () =>
		Promise.resolve({ json: () => Promise.resolve(body) }),
}));

vi.mock("./api", () => ({
	client: {
		api: {
			health: { $get: json({ status: "ok" }) },
			events: {
				$get: json([
					{
						id: "evt_1",
						name: "Spring Meetup",
						date: "2026-12-05",
						location: "Hall",
					},
				]),
				":eventId": { registrations: { $get: json([]) } },
			},
		},
	},
}));

describe("App", () => {
	it("shows the server status and events", async () => {
		render(<App />);
		expect(await screen.findByText("ok")).toBeTruthy();
		expect(await screen.findByText(/Spring Meetup/)).toBeTruthy();
	});
});
