import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";

vi.mock("./api", () => ({
	client: {
		api: {
			health: {
				$get: () =>
					Promise.resolve({ json: () => Promise.resolve({ status: "ok" }) }),
			},
		},
	},
}));

describe("App", () => {
	it("shows the server status", async () => {
		render(<App />);
		expect(await screen.findByText("ok")).toBeTruthy();
	});
});
