# Infrastructure Setup (one-time)

The deploy workflow (`.github/workflows/deploy.yml`) ships the app but does **not**
create infrastructure or credentials. Do this once; afterward every push to `main`
deploys via OIDC — no stored cloud secret.

## Easy path — run the script

```bash
az login          # the correct subscription
gh auth status    # confirm GitHub auth
./scripts/provision-azure.sh
```

`scripts/provision-azure.sh` is idempotent: it creates the Azure resources
(RG, ACR, Container Apps env, a tagged Log Analytics workspace, a Storage account
+ **Azure Files share** that the analytics SQLite DB mounts, and registers that
mount on the env), the OIDC federated credential, and sets the GitHub vars/secrets.
It adopts existing resources rather than inventing names, and prompts for the app
secrets (Twilio, OpenAI, slides URL, handoff number) — press Enter to skip any.

When it finishes: `gh workflow run deploy.yml`, watch the `Smoke test /health`
step, then `gh secret delete AZURE_CREDENTIALS` once green.

## What gets created / set

Azure: RG `rg-voice-ai-workshop`, ACR `voiceaiworkshop`, Container Apps env
`voiceaiworkshop`, Log Analytics `law-voiceaiworkshop`, Storage `voiceaiworkshop`
+ file share `voiceaidata` (mounted at `/app/appdata` for the analytics DB),
Container App `voice-ai-workshop`, a service principal `voice-ai-workshop-gha-deploy`
(AcrPush + Contributor) and a federated credential trusting
`repo:OWNER/REPO:ref:refs/heads/main`.

GitHub **variables**: `ACR_NAME`, `ACA_NAME`, `ACA_RESOURCE_GROUP`.
GitHub **secrets**: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`,
`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `OPENAI_API_KEY`,
`WORKSHOP_SLIDES_EMBED_URL`, `HANDOFF_PHONE_NUMBER`.

## Notes
- **Repository rename or transfer:** rerun `./scripts/provision-azure.sh`. It updates
  the existing `gha-main` federated credential to trust the repository's current
  `OWNER/REPO` subject.
- **Tenant tag policy:** every resource gets a `created_by` tag (RGs exempt);
  the script handles this, including a pre-created tagged Log Analytics workspace.
- **Workshop coupling:** the `/health` route the deploy smoke-tests is the same
  one chapter-6 teaches students to add to `server.mjs`. Keep them in sync.
- **Container manifest:** the app is deployed via `.github/containerapp.yaml`
  (env vars + secretRefs + the `appdata` Azure Files volume). The deploy injects
  the SHA-tagged image into it via `envsubst`.
