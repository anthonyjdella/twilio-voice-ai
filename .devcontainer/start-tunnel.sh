#!/usr/bin/env bash
set -euo pipefail

LOG=/tmp/cloudflared.log
URL_FILE=/tmp/cloudflared-url

# Already running? Nothing to do.
if pgrep -f "cloudflared tunnel --url" >/dev/null 2>&1; then
  exit 0
fi

rm -f "$LOG" "$URL_FILE"

# Cloudflare's free quick tunnel — no account, no signup, no interstitial.
# Forwards https://*.trycloudflare.com to http://localhost:8080.
nohup cloudflared tunnel \
  --url http://localhost:8080 \
  --no-autoupdate \
  > "$LOG" 2>&1 &

# Wait up to 30s for cloudflared to print the public URL.
for _ in $(seq 1 30); do
  if grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG" | head -1 > "$URL_FILE" 2>/dev/null; then
    if [ -s "$URL_FILE" ]; then break; fi
  fi
  sleep 1
done

URL="$(cat "$URL_FILE" 2>/dev/null || true)"
if [ -n "$URL" ]; then
  cat <<BANNER

================================================================
  Public TwiML URL: ${URL}/twiml
  Paste that into the Call Me widget on the workshop page.
  Run \`tunnel-url\` any time to print it again.
================================================================

BANNER
else
  echo "cloudflared did not start within 30 seconds; check $LOG"
fi
