#!/usr/bin/env bash
# Starts the assembled release the way the server does (from a copy, through start.cjs, with its own
# .env) and requests the login page. A release that crashes on its first request, like a missing
# package in node_modules, fails here instead of on the live site.
set -euo pipefail

RELEASE=$(mktemp -d)
# -l keeps symlinks as symlinks, exactly like the deploy's rsync.
rsync -rl apps/app/.next/standalone/ "$RELEASE/"
printf 'NODE_ENV=production\nAPI_BASE_URL=%s\n' "${API_BASE_URL:-https://crm-api.mkdir-solutions.com/api/v1}" > "$RELEASE/.env"

cd "$RELEASE/apps/app"
PORT=3999 HOSTNAME=127.0.0.1 node start.cjs > "$RELEASE/server.log" 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT

for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -m 10 -w "%{http_code}" http://127.0.0.1:3999/en/login || true)
  if [ "$code" = "200" ]; then
    echo "Smoke test passed: /en/login answered 200."
    exit 0
  fi
  sleep 1
done

echo "Smoke test FAILED: /en/login did not answer 200 (last: HTTP $code). Server output:"
cat "$RELEASE/server.log"
exit 1
