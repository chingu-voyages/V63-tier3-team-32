import { Hono } from "hono";

// Mock data. Replace with real data access when the database lands.
const events = [
	{
		id: "evt_1",
		name: "Spring Meetup",
		date: "2026-12-05",
		time: "18:30",
		location: "Community Hall",
		target: 80,
		state: "upcoming",
	},
	{
		id: "evt_2",
		name: "Autumn Workshop",
		date: "2026-10-12",
		time: "10:00",
		location: "Library Annex",
		target: 40,
		state: "completed",
	},
];

// Routes are chained (.get().get()) so Hono can infer their types for the web client.
export const eventsRoute = new Hono()
	// GET /api/events
	.get("/", (c) => c.json(events))
	// GET /api/events/:id
	.get("/:id", (c) => {
		const event = events.find((e) => e.id === c.req.param("id"));
		if (!event) return c.json({ error: "Event not found" }, 404);
		return c.json(event);
	});
