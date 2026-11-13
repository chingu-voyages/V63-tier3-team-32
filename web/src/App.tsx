import { useEffect, useState } from "react";
import { client } from "./api";

export function App() {
	const [status, setStatus] = useState<string>("loading…");

	useEffect(() => {
		client.api.health
			.$get()
			.then((res) => res.json())
			.then((body) => setStatus(body.status))
			.catch(() => setStatus("unreachable"));
	}, []);

	return (
		<main>
			<h1>Event Planner</h1>
			<p>
				Server status: <strong>{status}</strong>
			</p>
		</main>
	);
}
