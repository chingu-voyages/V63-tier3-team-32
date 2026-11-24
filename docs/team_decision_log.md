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
| 10 | 2026-11-25 | Front-end host | _to decide at the Sprint 3 meeting_ | | |
| 11 | 2026-11-25 | Staging database | _to decide at the Sprint 3 meeting_ | | |
| 12 | 2026-11-25 | Database access from the server | _to decide at the Sprint 3 meeting_ | | |
