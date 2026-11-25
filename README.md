# voyage-tasks

## Getting started

This project uses **[pnpm](https://pnpm.io)** as its only package manager. `npm install` and `yarn install` are blocked and will fail with a "Use pnpm" message.

### Prerequisites

- [Node.js](https://nodejs.org) 22 or newer
- pnpm 10.24.x (the exact version is pinned in `package.json` under `packageManager`)

### Install pnpm

The easiest way is [Corepack](https://nodejs.org/api/corepack.html), which ships with Node and automatically uses the pinned pnpm version:

```bash
corepack enable
```

Alternatively, install pnpm globally: `npm install -g pnpm@10.24.0`

Check it worked with `pnpm -v`.

### Install dependencies

```bash
pnpm install
```

### Project layout

```
web/      React 19 + Vite frontend      (@event-planner/web)
server/   Hono API on Node               (@event-planner/server)
```

`web` calls `server` through Hono's typed client and imports only the route type (`AppType`), so changing a route's response in `server` is a compile error in `web` until fixed.

### Adding a route (example)

`server/src/routes/events.ts` and `registrations.ts` return mock data and show the pattern:

1. Create a chained `new Hono().get(...)` router in `server/src/routes/`.
2. Mount it in `server/src/app.ts` with `.route("/api/<path>", router)`. Keep the chain so `AppType` includes it.
3. Call it from `web` through the typed client. For example, `client.api.events.$get()` is `GET /api/events`, and `client.api.events[":eventId"].registrations.$get({ param: { eventId } })` is `GET /api/events/:eventId/registrations`. See `web/src/components/EventList.tsx`.
4. Add a test with `app.request("/api/...")`, as in `server/src/routes/routes.test.ts`.

### Run the app

```bash
pnpm dev
```

This starts both apps in parallel:

- Web: <http://localhost:5173>. Vite proxies `/api` to the server, so no CORS setup is needed.
- Server: <http://localhost:3000> (set `PORT` to change it).

### Verify your setup

1. `pnpm install` finishes without errors.
2. `pnpm dev`, then open <http://localhost:5173>. The page should show **Server status: ok**.
3. `curl http://localhost:3000/api/health` returns `{"status":"ok"}`.
4. These all pass:

```bash
pnpm typecheck   # strict tsc in every package
pnpm lint        # Biome (use `pnpm format` to auto-fix)
pnpm test        # Vitest in every package
pnpm build       # production builds
```

### Git hooks and CI

[Lefthook](https://lefthook.dev) installs hooks automatically on `pnpm install` (skipped when `CI` is set).

- **pre-commit**: Biome checks and fixes staged files, and re-stages the fixes.
- **pre-push**: `pnpm lint` (includes the import boundary rules) and `pnpm typecheck`.

Editors: the repo ships `.vscode` settings (Biome format on save) and an `.editorconfig`. Biome is pinned to an exact version, so bump it deliberately.

Hooks are a convenience. `--no-verify` skips them, but never gets code past CI.

GitHub Actions (`.github/workflows/ci.yml`) runs on PRs to `main` and pushes to `main`, as four parallel jobs: `lint` (`biome ci`), `typecheck`, `test` (plus `build`) and `secrets` (`gitleaks` binary, pinned and checksum-verified, CI only).

Repo admins should protect `main`: require a pull request and require the `lint`, `typecheck`, `test` and `secrets` status checks before merging.

### Deployment

Production runs on Cloudflare. A single Worker (`server/wrangler.jsonc`) serves both apps from one origin:

- `/api/*` goes to the Hono API (`run_worker_first`).
- Everything else is served from `web/dist` as static assets, with single-page-app fallback to `index.html` for client-side routes.

Production URLs (one origin, `https://event-planner-server.chingu-v63.workers.dev`):

| What | URL |
| --- | --- |
| Frontend | <https://event-planner-server.chingu-v63.workers.dev> |
| Backend API | <https://event-planner-server.chingu-v63.workers.dev/api> (for example `/api/health`) |

Because the origin is shared, the web app needs no CORS setup or API base URL, and `hc<AppType>("/")` works unchanged in production.

`.github/workflows/deploy.yml` runs after CI succeeds on a push to `main`. It applies Supabase migrations, builds `web`, then runs `wrangler deploy` from `server/`. Pull requests are never deployed.

To deploy manually without CI, run `pnpm deploy:cloudflare` from the repo root (needs `wrangler login` or `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`). It ships your working tree and does not run Supabase migrations.

To preview the production setup locally, run `pnpm --filter @event-planner/web build`, then `pnpm --filter @event-planner/server exec wrangler dev`.

### Common commands

| Task | npm equivalent | pnpm command |
| --- | --- | --- |
| Install all dependencies | `npm install` | `pnpm install` |
| Add a dependency | `npm install <pkg>` | `pnpm add <pkg>` |
| Add a dev dependency | `npm install -D <pkg>` | `pnpm add -D <pkg>` |
| Remove a dependency | `npm uninstall <pkg>` | `pnpm remove <pkg>` |
| Update dependencies | `npm update` | `pnpm update` |
| Run a script | `npm run <script>` | `pnpm run <script>` (or `pnpm <script>`) |
| Run a one-off package | `npx <pkg>` | `pnpm dlx <pkg>` |

### Good to know

- Commit `pnpm-lock.yaml`. It keeps everyone on identical dependency versions.
- Never commit `node_modules/`, `package-lock.json` or `yarn.lock`.
- pnpm keeps one shared copy of each package on disk and links it into `node_modules`, so installs are fast and use less space. It is also strict: you can only import packages you declared in `package.json`.

### Troubleshooting

- **"Use "pnpm install" for installation in this project"**: you ran `npm` or `yarn`. Delete any `package-lock.json`/`yarn.lock` and `node_modules`, then run `pnpm install`.
- **`pnpm: command not found`**: run `corepack enable`, or install pnpm globally (see above).
- **Version or engine mismatch errors**: update Node to 22+ and make sure `pnpm -v` matches the version in `package.json`.
- **Odd install problems**: remove `node_modules` and run `pnpm install` again; `pnpm store prune` clears unused packages from the shared store.

## Team Documents

You may find these helpful as you work together to organize your project.

- [Team Project Ideas](./docs/team_project_ideas.md)
- [Team Decision Log](./docs/team_decision_log.md)

Meeting Agenda templates (located in the `/docs` directory in this repo):

- Meeting - Voyage Kickoff --> ./docs/meeting-voyage_kickoff.docx
- Meeting - App Vision & Feature Planning --> ./docs/meeting-vision_and_feature_planning.docx
- Meeting - Sprint Retrospective, Review, and Planning --> ./docs/meeting-sprint_retrospective_review_and_planning.docx
- Meeting - Sprint Open Topic Session --> ./docs/meeting-sprint_open_topic_session.docx

## Our Team

Everyone on your team should add their name along with a link to their GitHub
& optionally their LinkedIn profiles below. Do this in Sprint #1 to validate
your repo access and to practice PR'ing with your team *before* you start
coding!

- Fouad: [GitHub](https://github.com/ghaccountname) / [LinkedIn](https://linkedin.com/in/liaccountname)
- Rishabh: [GitHub](https://github.com/rishabh1024) / [LinkedIn](https://www.linkedin.com/in/rishabh-aggarwal20/)
- Nick: [GitHub](https://github.com/patonik) / [LinkedIn](https://linkedin.com/in/liaccountname)

   ...
- Teammate name #n: [GitHub](https://github.com/ghaccountname) / [LinkedIn](https://linkedin.com/in/liaccountname)
