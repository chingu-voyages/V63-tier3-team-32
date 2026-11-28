import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { accessKey } from "../accessKey";
import { AccessGate } from "./AccessGate";

beforeEach(() => sessionStorage.clear());
afterEach(cleanup);

describe("AccessGate", () => {
	it("asks for the key and stores it in sessionStorage", () => {
		render(
			<AccessGate>
				<p>secret content</p>
			</AccessGate>,
		);
		expect(screen.queryByText("secret content")).toBeNull();

		fireEvent.change(screen.getByLabelText("Access key"), {
			target: { value: "  my-key " },
		});
		fireEvent.click(screen.getByText("Continue"));

		expect(screen.getByText("secret content")).toBeTruthy();
		expect(sessionStorage.getItem("accessKey")).toBe("my-key");
	});

	it("skips the prompt when a key is already stored", () => {
		accessKey.set("stored");
		render(
			<AccessGate>
				<p>secret content</p>
			</AccessGate>,
		);
		expect(screen.getByText("secret content")).toBeTruthy();
	});

	it("asks again when the key is cleared after a 401", () => {
		accessKey.set("stale");
		render(
			<AccessGate>
				<p>secret content</p>
			</AccessGate>,
		);
		act(() => accessKey.clear());
		expect(screen.queryByText("secret content")).toBeNull();
		expect(screen.getByLabelText("Access key")).toBeTruthy();
	});
});
