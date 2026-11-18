import postgres, { type Sql } from "postgres";

let sql: Sql | null = null;

// Lazy singleton: created on first use so importing this module (e.g. in tests)
// doesn't require env vars to be set. DATABASE_URL holds the Postgres password,
// so it must only ever live in server code — never in the web app.
export function getDBClient(): Sql {
	if (sql) return sql;

	const connectionString = process.env.DATABASE_URL;

	if (!connectionString) {
		throw new Error("DATABASE_URL must be set");
	}

	// prepare: false is a no-op on the session pooler (port 5432, what we use),
	// which supports prepared statements. It's set anyway so this still works
	// unmodified if the connection string ever moves to the transaction-mode
	// pooler (port 6543) or a serverless/edge runtime, neither of which do.
	sql = postgres(connectionString, { prepare: false });
	return sql;
}
