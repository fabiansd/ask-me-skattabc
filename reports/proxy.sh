#!/usr/bin/env bash
# Standalone Fly.io Postgres proxy for ad-hoc exploration (psql, etc.).
# The `npm run report` command spawns its own proxy and does NOT need this.
# Usage:  npm run proxy:db
# Tunnel: localhost:5432 -> skatt-abc-db (prod)

set -euo pipefail

APP_NAME="${FLY_DB_APP:-skatt-abc-db}"
LOCAL_PORT="${LOCAL_PG_PORT:-5432}"

echo "Opening Fly proxy to $APP_NAME on localhost:$LOCAL_PORT (Ctrl-C to stop)..."
exec flyctl proxy "$LOCAL_PORT:5432" --app "$APP_NAME"
