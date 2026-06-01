# Deployment

The app deploys to **Azure Container Apps** via `.github/workflows/deploy.yml`,
gated behind CI. Auth is OIDC — no stored cloud credentials.

## How it works

Every push to `main` (or a manual **Run workflow**) runs three jobs:

1. **`ci`** — reuses `.github/workflows/ci.yml` (the `Validate` gate: lint + typecheck, `next build`, gitleaks, dependency-review). Red CI ⇒ build + deploy skipped.
2. **`build-and-push`** — OIDC login → Buildx build (gha cache) → push a SHA-tagged image to ACR.
3. **`deploy`** — OIDC login → sync app secrets (skip-on-unset) → apply `.github/containerapp.yaml` (image injected via `envsubst`) → poll `GET /health` until 200.

`concurrency: deploy-prod` with `cancel-in-progress: false` ensures a prod deploy is never cancelled mid-update.

## State / data

The analytics SQLite DB lives on an **Azure Files share** (`voiceaidata`) mounted at `/app/appdata` via the `appdata` volume in `containerapp.yaml` — so analytics survive redeploys.

## Prerequisites

One-time Azure provisioning + GitHub vars/secrets: run `./scripts/provision-azure.sh` (after `az login`) — see **[INFRA_SETUP.md](./INFRA_SETUP.md)**.

## Rollback

Re-run the deploy from a previous green commit (each image is SHA-tagged in ACR), or:
```bash
# edit containerapp.yaml's image, or:
az containerapp update -n voice-ai-workshop -g rg-voice-ai-workshop \
  --image voiceaiworkshop.azurecr.io/voice-ai-workshop:<previous-sha>
```

## Health

`GET /health` → `{"status":"ok","uptime":<seconds>}` — unauthenticated, no dependency. This is the route taught in chapter-6; the deploy smoke-tests it.
