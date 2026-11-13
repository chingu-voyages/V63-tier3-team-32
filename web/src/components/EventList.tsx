import type { InferResponseType } from "hono/client";
import { useEffect, useState } from "react";
import { client } from "../api";

// TEMPORARY: these types are inferred from the mocked server routes so the example works
// without a database. Once Supabase is set up, replace them with the generated Supabase types.
type EventItem = InferResponseType<typeof client.api.events.$get>[number];
type RegistrationItem = InferResponseType<
	(typeof client.api.events)[":eventId"]["registrations"]["$get"]
>[number];

export function EventList() {
	const [events, setEvents] = useState<EventItem[]>([]);
	const [selected, setSelected] = useState<string | null>(null);
	const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);

	// GET /api/events
	useEffect(() => {
		client.api.events
			.$get()
			.then((res) => res.json())
			.then(setEvents);
	}, []);

	// GET /api/events/:eventId/registrations. Path params go in `param`.
	async function showRegistrations(eventId: string) {
		const res = await client.api.events[":eventId"].registrations.$get({
			param: { eventId },
		});
		setRegistrations(await res.json());
		setSelected(eventId);
	}

	return (
		<section>
			<h2>Events</h2>
			<ul>
				{events.map((event) => (
					<li key={event.id}>
						{event.name} ({event.date}, {event.location}){" "}
						<button type="button" onClick={() => showRegistrations(event.id)}>
							Registrations
						</button>
					</li>
				))}
			</ul>
			{selected && (
				<ul aria-label="Registrations">
					{registrations.map((r) => (
						<li key={r.registrationId}>
							{r.name} [{r.registrationId}] {r.checkedIn ? "checked in" : ""}
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
