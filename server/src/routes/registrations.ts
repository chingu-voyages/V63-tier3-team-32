import { Hono } from "hono";

const registrations = [
	{
		registrationId: "K7M2QX",
		eventId: "evt_1",
		name: "Ada Lovelace",
		source: "Email",
		checkedIn: false,
	},
	{
		registrationId: "P4T9WB",
		eventId: "evt_1",
		name: "Grace Hopper",
		source: null,
		checkedIn: false,
	},
	{
		registrationId: "H3N8ZD",
		eventId: "evt_2",
		name: "Alan Turing",
		source: "Referral",
		checkedIn: true,
	},
];

// Mounted under /api/events/:eventId/registrations in app.ts.
export const registrationsRoute = new Hono().get("/", (c) => {
	const eventId = c.req.param("eventId");
	return c.json(registrations.filter((r) => r.eventId === eventId));
});
