import { Hono } from "hono";
import { z } from "zod";

export const healthSchema = z.object({ status: z.literal("ok") });

const app = new Hono().get("/api/health", (c) =>
	c.json(healthSchema.parse({ status: "ok" })),
);

export type AppType = typeof app;
export default app;
