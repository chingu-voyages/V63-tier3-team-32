import { type ReactNode, useEffect, useState } from "react";
import { ACCESS_KEY_CLEARED, accessKey } from "../accessKey";

export function AccessGate({ children }: { children: ReactNode }) {
	const [hasKey, setHasKey] = useState(() => accessKey.get() !== null);
	const [draft, setDraft] = useState("");

	useEffect(() => {
		const onCleared = () => setHasKey(false);
		window.addEventListener(ACCESS_KEY_CLEARED, onCleared);
		return () => window.removeEventListener(ACCESS_KEY_CLEARED, onCleared);
	}, []);

	if (hasKey) return children;

	return (
		<main>
			<h1>Event Planner</h1>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					accessKey.set(draft.trim());
					setDraft("");
					setHasKey(true);
				}}
			>
				<label>
					Access key
					<input
						type="password"
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						required
					/>
				</label>
				<button type="submit">Continue</button>
			</form>
		</main>
	);
}
