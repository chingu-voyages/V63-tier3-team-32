# Team Decision Log

Key decisions the team has made, newest at the bottom. To change a decision,
add a new row that supersedes the old one instead of editing it.

Decisions are made in team meetings or by Discord poll (project management
topic, majority vote).

| No. | Date | Topic | Options considered | Decision | Reason |
| :-- | :--- | :---- | :----------------- | :------- | :----- |
| 1 | 2026-11-16 | Tech stack | — | pnpm monorepo: React 19 + Vite (`web/`), Hono + Zod (`server/`), TypeScript | Single repo for front end and back end; shared tooling |
| 2 | 2026-11-12 | Package manager | npm, pnpm | pnpm only (enforced by `only-allow`) | Fast installs and workspace support for the monorepo (#36) |
| 3 | 2026-11-16 | Database | — | Supabase (PostgreSQL). How the server accesses it: see row 12 | Relational data, managed service, free tier (#43) |
| 4 | 2026-11-19 | Server host | Render, Railway, Fly.io, Cloudflare Workers (Vercel excluded: free tier restricts organisation repos) | Cloudflare Workers, deployed from `main` | Free tier, deploy from GitHub Actions (#46, #54) |
| 5 | 2026-11-16 | CI and branch protection | — | CI runs lint, typecheck, test and secrets scan. `main` requires a PR, 1 approval and green checks; squash or rebase merge only | Keep `main` deployable (#51) |
| 6 | 2026-11-23 | Workflow (poll 1) | Yes · Yes, with changes · No | Adopted: issue → assign yourself (max 2 in progress) → branch → PR with `Closes #n` → approval + green checks → author squash-merges. Daily status: done / next / blockers | One shared, predictable way of working. See [INSTRUCTIONS.md](../INSTRUCTIONS.md) |
| 7 | 2026-11-23 | AI use in code (poll 2) | No AI-written code · AI for boilerplate/config/tests/docs/review · AI can generate features | AI for boilerplate, config, tests, docs and review. Feature logic is written by hand. Each PR describes its AI use | Everyone learns from the feature work while saving time on the rest. See [INSTRUCTIONS.md](../INSTRUCTIONS.md) |
| 8 | 2026-11-23 | AI integration (poll 10) | LangGraph · Direct LLM API calls + Zod-validated JSON · Quick test of both | Direct LLM API calls, JSON output validated with Zod. No LangGraph for the MVP | Simpler, fewer dependencies, Zod already in the stack (#48 closed) |
| 9 | 2026-11-23 | Board setup (poll 11) | Yes · Yes, with changes · No | Adopted: columns Backlog → Ready → In Progress → In Review → Done; epics as parent issues with sub-issues; Priority, Area, Sprint and Size fields | Clear view of the MVP scope and sprint load |
| 10 | 2026-11-25 | Front-end host | Cloudflare · Netlify · Render · GitHub Pages | Cloudflare, same account as the server. Owner: Fouad | One account and one deploy workflow for both apps (#46) |
| 11 | 2026-11-25 | Staging database | Second free Supabase project · share production · no staging | No staging database | Keep the setup small for the MVP |
| 12 | 2026-11-25 | Database access (supersedes the 16 Nov "Data API off" note) | A: direct Postgres connection, Data API off · B: supabase-js, Data API on, RLS on every table | B: supabase-js with the Data API on; row-level security on every table. Owner: Rishabh | Matches PR #52 and the data model; Supabase handles guest sessions |
| 13 | 2026-11-25 | Attendee registration | Organiser enters attendees · import from an external form · in-app public registration | The organiser enters attendees in the app; an external registration link is information only | Keeps check-in and figures on one list we control |
| 14 | 2026-11-25 | Check-in | Organiser check-in · public self check-in | Only the organiser checks people in. Self check-in is out of the MVP | Simpler scope; no public page to secure |
| 15 | 2026-11-25 | Promotions | Update in place · a new version per change | One promotion per draft, updated in place (manual edit or AI revision). No version history. The `promo_drafts` table becomes `promotions` | US-10 does not need to restore an earlier version |
| 16 | 2026-11-25 | Analyses | Many per event · one per event | At most one analysis per event; regenerating replaces it | Matches the data model |
| 17 | 2026-11-25 | Promotional source values | `social_media` · `social` | `email`, `social`, `referral`, `other`; an empty answer counts as `unknown` | One set of values in the API, the database and the charts |
| 18 | 2026-11-25 | API conventions | Nested or flat routes; error format | Routes nested under their event everywhere. Zod schemas in `server/` are the contract. Errors return `{ error: { code, message } }`; 429 when the AI usage cap is hit. Endpoints: see below. Owner of the OpenAPI document: Nick | One rule for every resource; one source of truth for shapes |

## API endpoints (agreed 2026-11-25)

All paths start with `/api`. Request and response shapes come from the Zod
schemas in `server/`; Nick turns this list into an OpenAPI document.

### Health and access

| Method | Path | Purpose | Story |
| :-- | :--- | :------ | :---- |
| GET | `/health` | Server status | — |
| — | — | Guest login uses Supabase anonymous sign-in; no endpoint of ours | US-01 |

### Events

| Method | Path | Purpose | Story |
| :-- | :--- | :------ | :---- |
| GET | `/events` | List events, including history (`?status=draft\|upcoming\|completed`) | US-02, US-11 |
| POST | `/events` | Create an event | US-02 |
| GET | `/events/{eventId}` | View one event | US-02 |
| PATCH | `/events/{eventId}` | Edit an event; also moves it from draft to upcoming (server checks date and location are set) | US-03 |
| POST | `/events/{eventId}/complete` | Complete an event and enter its revenue | US-14 |

### Registrations (attendees)

| Method | Path | Purpose | Story |
| :-- | :--- | :------ | :---- |
| GET | `/events/{eventId}/registrations` | List or search attendees (`?name=Ada` or `?registrationId=K7Q2MX`) | US-04 |
| POST | `/events/{eventId}/registrations` | Add an attendee, with an optional `source` | US-04, US-12 |
| GET | `/events/{eventId}/registrations/{registrationId}` | View one attendee | US-04 |
| PATCH | `/events/{eventId}/registrations/{registrationId}` | Edit attendee details | US-04 |
| _open_ | _check-in and undo_ | Check-in is two fields on the registration, not a new table. Endpoint style still open: `PATCH` on the registration, or `POST`/`DELETE …/check-in` | US-05 |

### Figures and analysis

| Method | Path | Purpose | Story |
| :-- | :--- | :------ | :---- |
| GET | `/events/{eventId}/figures` | Figures calculated in code, no AI: registrations, attendance, rate, vs target, revenue, turnout by source | US-06, US-07, US-13 |
| GET | `/events/{eventId}/analysis` | Read the saved AI analysis | US-06 |
| POST | `/events/{eventId}/analysis` | Generate or regenerate the AI analysis (replaces the old one) | US-06, US-07 |
| POST | `/events/comparisons` | Compare 2 or more completed events, with an AI summary (body: event IDs) | US-11 |

### Promotion

| Method | Path | Purpose | Story |
| :-- | :--- | :------ | :---- |
| GET | `/events/{eventId}/promo-brief` | Read the promo brief | US-08 |
| PUT | `/events/{eventId}/promo-brief` | Save the promo brief | US-08 |
| POST | `/events/{eventId}/promotions` | Generate a promotion (email subject, body, social caption) | US-09 |
| GET | `/events/{eventId}/promotions` | List promotions | US-09 |
| GET | `/events/{eventId}/promotions/{promotionId}` | View one promotion | US-09 |
| PATCH | `/events/{eventId}/promotions/{promotionId}` | Edit a promotion by hand | US-10 |
| POST | `/events/{eventId}/promotions/{promotionId}/revisions` | Ask the AI to revise it ("shorter", "friendlier"); the promotion is updated and returned | US-10 |

No delete endpoints in the MVP.

`/events/comparisons` must be registered before `/events/{eventId}` in Hono, so
"comparisons" is not read as an event ID.
