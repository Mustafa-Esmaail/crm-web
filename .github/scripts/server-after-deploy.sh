#!/usr/bin/env bash
# Runs ON THE SERVER after the release was uploaded (the workflow pipes it over ssh).
# Needs: APP_DIR, DOCROOT, API_BASE_URL, SITE_URL.
set -euo pipefail
cd "$APP_DIR"

echo "== node"
NODE_BIN="$(command -v node || true)"
for candidate in /opt/alt/alt-nodejs22/root/usr/bin/node /opt/alt/alt-nodejs24/root/usr/bin/node /opt/alt/alt-nodejs20/root/usr/bin/node; do
  if [ -z "$NODE_BIN" ] && [ -x "$candidate" ]; then NODE_BIN="$candidate"; fi
done
test -n "$NODE_BIN" || { echo "ERROR: no node binary found on the server."; exit 1; }
"$NODE_BIN" -e 'const m=+process.versions.node.split(".")[0]; if (m < 20) { console.error("ERROR: Node " + process.version + " is too old; Next.js needs 20.9+"); process.exit(1) } console.log("node", process.version)'
echo "using $NODE_BIN"

echo "== .env"
# Created once; after that it is the server's file and never touched.
if [ ! -f .env ]; then
  printf 'NODE_ENV=production\nAPI_BASE_URL=%s\n' "$API_BASE_URL" > .env
  echo "Created $APP_DIR/.env"
fi
chmod 600 .env

echo "== subdomain .htaccess"
mkdir -p "$DOCROOT"
# A default page in the folder would be served instead of the app, so it is moved aside.
for f in index.html index.php default.php; do
  if [ -f "$DOCROOT/$f" ]; then
    mkdir -p "$APP_DIR/../crm-web-docroot-backup"
    mv "$DOCROOT/$f" "$APP_DIR/../crm-web-docroot-backup/$f.$(date +%Y%m%d%H%M%S)"
    echo "Moved $f out of the subdomain folder."
  fi
done
cat > "$DOCROOT/.htaccess" <<HTACCESS
# Written by the crm-web deploy workflow: LiteSpeed runs the Next.js app with Node.
PassengerAppRoot "$APP_DIR/apps/app"
PassengerBaseURI "/"
PassengerNodejs "$NODE_BIN"
PassengerAppType node
PassengerStartupFile start.cjs
HTACCESS

echo "== restart"
mkdir -p apps/app/tmp
touch apps/app/tmp/restart.txt
# Stop the running app so the new code is loaded on the next request (only this user's processes).
pkill -u "$(id -u)" -f "$APP_DIR/apps/app" || true

echo "== health check"
# The first request starts the app, so give it time.
code=""
for i in $(seq 1 12); do
  code=$(curl -s -o /dev/null -m 20 -w "%{http_code}" "$SITE_URL/en/login" || true)
  echo "try $i: HTTP $code"
  if [ "$code" = "200" ]; then echo "== deploy finished"; exit 0; fi
  sleep 5
done
echo "ERROR: $SITE_URL/en/login did not answer 200 (last: HTTP $code)."
if [ -f "$APP_DIR/apps/app/stderr.log" ]; then
  echo "== last lines of stderr.log"
  tail -n 40 "$APP_DIR/apps/app/stderr.log"
fi
exit 1
