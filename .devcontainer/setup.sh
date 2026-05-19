#!/usr/bin/env bash
set -euo pipefail

# Install cloudflared (used to expose port 8080 to Twilio without
# the GitHub Codespaces port-warning interstitial).
if ! command -v cloudflared >/dev/null 2>&1; then
  echo "Installing cloudflared..."
  curl -fsSL \
    https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
    -o /tmp/cloudflared
  sudo install -m 0755 /tmp/cloudflared /usr/local/bin/cloudflared
  rm /tmp/cloudflared
fi

# Helper command attendees can run any time to print their public TwiML URL.
sudo install -m 0755 .devcontainer/tunnel-url /usr/local/bin/tunnel-url

# Install workshop dependencies.
cd workshop
npm install

# Seed .env from the Codespace's pre-shared workshop secrets.
cat > .env <<EOF
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID:-}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN:-}
TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER:-}
OPENAI_API_KEY=${OPENAI_API_KEY:-}
OPENAI_MODEL=${OPENAI_MODEL:-}
HANDOFF_PHONE_NUMBER=${HANDOFF_PHONE_NUMBER:-}

# Set this to your personal phone number in E.164 format
MY_PHONE_NUMBER=+15551234567
EOF
