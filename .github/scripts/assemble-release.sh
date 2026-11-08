#!/usr/bin/env bash
# Turns the standalone build into the folder the server runs (used by CI's smoke test and the deploy):
# server.js does not include static assets, so they are copied next to it, and start.cjs loads the
# server's .env (never uploaded) before starting server.js.
set -euo pipefail

APP=apps/app
OUT=$APP/.next/standalone

mkdir -p "$OUT/$APP/.next"
rm -rf "$OUT/$APP/.next/static"
cp -r "$APP/.next/static" "$OUT/$APP/.next/static"
if [ -d "$APP/public" ]; then cp -r "$APP/public" "$OUT/$APP/public"; fi

cat > "$OUT/$APP/start.cjs" <<'EOF'
// Loads ~/crm-web/.env (server-only, never uploaded), then starts Next's standalone server.
const fs = require('node:fs');
const path = require('node:path');
const envFile = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
require('./server.js');
EOF

test -f "$OUT/$APP/server.js"
echo "Release assembled in $OUT"
