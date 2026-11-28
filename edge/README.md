# Edge Worker and API access

The edge Worker is the public entry point. It serves the built web app and is the only way the browser reaches the API. This page covers how requests are authenticated, how to work with it locally and how to reach the deployed apps.

## Request flow

```
Browser ──X-Access-Key──▶ Edge Worker ──X-Service-Token──▶ Server Worker
                          checks the key,                  verifies the token,
                          strips it,                       rejects otherwise
                          signs a token
```

| Layer | Header | Sent by | Checked by | Guards |
| --- | --- | --- | --- | --- |
| Access Key | `X-Access-Key` | Browser (stored in `sessionStorage`) | Edge | Browser to edge: only people with the key get data |
| Service Token | `X-Service-Token` | Edge (HS256 JWT, 60 s) | Server | Edge to server: only the edge can call the server |

- The edge reaches the server through the `API` service binding, not the server's public URL.
- The server's `workers.dev` URL is still public. The service token is what keeps it closed, so it is required on every `/api/*` route, including health.
- Static assets (`/`, `/assets/*`) are served without a key. Only `/api/*` runs the Worker (`run_worker_first`). The bundle must never contain secrets.
- Both checks fail closed: a missing secret returns 500, never "allow".
- Signing and verification share one module, `server/src/lib/service-token.ts` (header name, algorithm, issuer, audience, TTL).

## Secrets

| Secret | Where | Notes |
| --- | --- | --- |
| `ACCESS_KEY` | Edge only | The shared passphrase users type in. Use a random value. |
| `SERVICE_JWT_SECRET` | Edge **and** server | Must be identical on both. Keep it different from `ACCESS_KEY`. |
| `SUPABASE_URL` | Server only | Supabase project URL. |
| `SUPABASE_SECRET_KEY` | Server only | Bypasses RLS. Never give it to the edge or the web app. Get it from whoever owns the Supabase project. |

Local values live in gitignored files. Copy each `*.example` file and fill it in:

| Copy | To | Needed for |
| --- | --- | --- |
| `server/.env.example` | `server/.env` | `pnpm dev`, server tests that touch Supabase, `mint-token`. Also read by Vite for the dev service token. |
| `server/.dev.vars.example` | `server/.dev.vars` | `pnpm dev:edge` |
| `edge/.dev.vars.example` | `edge/.dev.vars` | `pnpm dev:edge` |

`SERVICE_JWT_SECRET` must be the same in all three files. Running only the server, or only the web app and server, needs just `server/.env`. Running only the edge needs just `edge/.dev.vars`. The root `.env.example` lists every variable in one place. Local values do not need to match production and should not.

Set or rotate a deployed secret (no redeploy needed, it applies within seconds):

```bash
cd edge
printf '%s' "$(openssl rand -hex 24)" | pnpm exec wrangler secret put ACCESS_KEY
```

Use `printf '%s'`, not a pasted value with a trailing newline. Rotating `SERVICE_JWT_SECRET` means running `secret put` with the same value in both `edge/` and `server/`, or the server will reject every request from the edge. Secret values cannot be read back from Cloudflare, so store them in a password manager.

## Local development

| Command | What runs | Use it for |
| --- | --- | --- |
| `pnpm dev` | Vite on `:5173` and the Node server on `:3000` | Day-to-day work. Open <http://localhost:5173>. |
| `pnpm dev:edge` | Edge and server Workers together in one Wrangler session (`:8787`) | Checking the real edge, service binding and assets before deploying. Needs `pnpm build` first and the `.dev.vars` files. |

In `pnpm dev` the edge is not involved. A Vite plugin (`web/vite.config.ts`) signs the service token for `/api/*`, so browser calls work. The access key prompt still appears, but the key is not checked, so any value is accepted. Do not open `:8787` unless you started `dev:edge`: without it, the server Worker is missing and the status line shows `unreachable`.

## Testing access

Through the edge, as a user would:

```bash
curl -H 'X-Access-Key: <key>' https://event-planner.chingu-v63.workers.dev/api/health
```

Directly to the server, which needs a service token minted from the production secret:

```bash
cd server
read -rs SERVICE_JWT_SECRET && export SERVICE_JWT_SECRET   # paste, press Enter
T=$(pnpm -s mint-token)
curl -H "X-Service-Token: $T" https://event-planner-server.chingu-v63.workers.dev/api/health
unset SERVICE_JWT_SECRET T
```

Locally, `pnpm --filter @event-planner/server mint-token` reads `server/.env`. Tokens last 60 seconds.

Expected results: no or wrong credential gives `401`; a missing secret on the Worker gives `500`. The edge and the server return the same 401 body, so if a request is rejected, tail both Workers (`pnpm exec wrangler tail <worker-name>`) to see which layer answered. Wrong key: only the edge logs the request. Right key but mismatched `SERVICE_JWT_SECRET`: the server logs it too.

## Deployment

`pnpm deploy:cloudflare` builds the web app, then deploys the server, then the edge. `.github/workflows/deploy.yml` does the same order on pushes to `main`. The server goes first because the edge's service binding needs it to exist. The edge serves `web/dist` as it was at deploy time, so redeploy it to ship web changes.

## Gotchas

- A Worker module can only export its handler. An extra named export (a shared constant, for example) stops the Worker starting in the Cloudflare runtime, even though unit tests pass.
- The Self Check-in routes (ADR 0002) are public. When they are built they need an exemption from the access key check in `edge/src/worker.ts`.
- After `wrangler secret put`, wait a few seconds before testing.
