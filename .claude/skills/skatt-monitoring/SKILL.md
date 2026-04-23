---
name: skatt-monitoring
description: Generate a user and query activity report from the skatt-abc production Postgres on Fly.io. Use when the user asks for a monitoring report, ad campaign results, new users, signups, active users, query counts, or any "how's the app doing" question for skatt-abc / ask-me-skattabc.
---

# skatt-abc monitoring report

Runs read-only analytics against the production Postgres (`skatt-abc-db` on Fly.io) via a self-cleaning `flyctl proxy` tunnel. The campaign baseline date is **2026-04-21**.

## Prerequisites (already set up in this repo)

- `flyctl` installed and authenticated (`flyctl auth whoami`).
- `.env.monitor` at repo root with `DATABASE_URL=postgres://<user>:<password>@localhost:5432/<db>?sslmode=disable` (gitignored).
- `node_modules` installed (`npm install`).

If any prerequisite is missing, stop and tell the user.

## Workflow

1. Run:

   ```bash
   npm run report -- --since 2026-04-21
   ```

   The script at `reports/report.ts` spawns `flyctl proxy 5432:5432 --app skatt-abc-db`, waits for the port, runs queries, writes `reports/latest.json` plus a Cursor canvas, and always tears the proxy down (on exit, error, SIGINT, SIGTERM).

2. Surface the stdout summary to the user, and point them at the canvas file the command prints (path starts with `~/.cursor/projects/.../canvases/skatt-monitoring.canvas.tsx`). Never paste large result tables into chat — they're already in the canvas.

3. If the user asks about a different window, pass a different `--since <ISO-date>` (e.g. `--since 2026-04-14` for "last week").

## Useful flags

- `--since <ISO-date>` — window start. Default: `2026-04-21`.
- `--limit <N>` — top-active-users row count. Default: `20`.

## Troubleshooting

- **"Port 127.0.0.1:5432 not reachable"**: another process is already bound to 5432 or flyctl is not authed.
  - `lsof -i :5432` to find conflicts; stop the local dev DB (`npm run dev:db:stop` is safe — the dev DB runs on 5433, but other Postgres installs may grab 5432).
  - Re-run `flyctl auth login` if `flyctl auth whoami` fails.
- **Prisma "Can't reach database server at localhost:5432"**: proxy didn't start in time. Re-run; it retries internally.
- **Wrong host in `.env.monitor`**: the URL must be `@localhost:5432`, NOT `@skatt-abc-db.flycast:5432`. The proxy provides the localhost endpoint.

## What the report contains

`reports/latest.json` and the canvas render:
- Totals: users, queries (`query_history`), feedback
- In-range counts since `--since`
- Auth-provider split (default vs google)
- Daily signups and daily queries in range
- Top N active users in range (username, created_at, queries_in_range, last_activity)
- Recent feedback entries in range

All queries are read-only; the report never writes to prod.
