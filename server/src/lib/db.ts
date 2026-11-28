import type { Database } from "@event-planner/db-types";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient<Database> | null = null;

// Lazy singleton: created on first use so importing this module (e.g. in tests)
// doesn't require env vars to be set. SUPABASE_SECRET_KEY bypasses RLS,
// so this client must only ever live in server code — never in the web app.
export function getSupabaseClient(): SupabaseClient<Database> {
	if (client) return client;

	const url = process.env.SUPABASE_URL;
	const secretKey = process.env.SUPABASE_SECRET_KEY;

	if (!url || !secretKey) {
		throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set");
	}

	client = createClient<Database>(url, secretKey, {
		auth: { persistSession: false, autoRefreshToken: false },
	});
	return client;
}
