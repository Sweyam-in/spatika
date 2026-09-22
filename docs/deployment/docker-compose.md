# Docker Compose Production Deployment (Atlas VM)

Docker Compose on the **Atlas VM** is the production environment for the Spatika documentation website, replacing the previous k3s deployment and adopting the same isolated container architecture used in `kasho` and `sweyam-auth`.

---

## Architecture Overview

```
                                  Internet
                                     │
                          ┌──────────▼──────────┐
                          │  Cloudflare Tunnel  │ (cloudfare-kasho container)
                          └──────────┬──────────┘
                                     │ spatika.sweyam.com
                          ┌──────────▼──────────┐
                          │     spatika-web     │ (nginx serving static build)
                          └─────────────────────┘

             Tailscale Network ───► Dozzle (:9997) ───► docker-socket-proxy (read-only)
```

1. **Edge & Ingress (Reusing Kasho Tunnel)**:
   - The existing `cloudfare-kasho` tunnel container runs on the shared Docker network (`kasho_edge`).
   - `spatika-web` joins `kasho_edge` with alias `spatika` and `spatika-web`.
   - The tunnel routes `spatika.sweyam.com` → `http://spatika-web:80`.
2. **Observability**:
   - Dozzle log viewer bound strictly to the Tailscale IP (`ATLAS_LOGS_BIND_IP:9997`) behind a read-only Docker socket proxy (`docker-socket-proxy`).

---

## Initial Atlas VM Host Setup

On the Atlas VM, create the application directory (one-time setup):

```bash
sudo install -d -m 0750 -o deploy -g deploy /opt/spatika/app
```

Ensure the user is in the `docker` group and the shared edge network exists (if not already created):

```bash
docker network create kasho_edge 2>/dev/null || true
```

---

## Cloudflare Zero Trust Tunnel Setup

Since we are reusing the existing Kasho Cloudflare Tunnel:

1. Open **Cloudflare Zero Trust Dashboard** → **Networks** → **Tunnels**.
2. Edit the existing Kasho Tunnel (`cloudfare-kasho`).
3. Add a **Public Hostname** route:

| Public Hostname | Service Type | URL |
|-----------------|--------------|-----|
| `spatika.sweyam.com` | HTTP | `spatika-web:80` |

4. Save hostname configuration. Requests for `spatika.sweyam.com` will route through the tunnel to the `spatika-web` container on the `kasho_edge` network.

---

## Deploy from Local Checkout

1. Copy and configure local deployment files (gitignored):

```bash
cd /path/to/spatika

cp prod-deploy/.env.production.example prod-deploy/.env.production
cp prod-deploy/atlas.deploy.env.example prod-deploy/atlas.deploy.env
chmod 600 prod-deploy/.env.production prod-deploy/atlas.deploy.env

cp scripts/build-push-ghcr.env.example scripts/build-push-ghcr.env
```

2. Configure deployment variables:
   - `prod-deploy/atlas.deploy.env`: Set `ATLAS_HOST` (e.g. Atlas VM IP) and `ATLAS_USER` / `ATLAS_SSH_KEY`.
   - `prod-deploy/.env.production`: Set `ATLAS_LOGS_BIND_IP` (Tailscale IP).
   - `scripts/build-push-ghcr.env`: Set `GHCR_OWNER` (e.g. `sreelalchalil`) and GHCR credentials if not already logged in with docker.

3. Deploy to the Atlas VM:

```bash
# Full build + push to GHCR + remote rollout
./prod-deploy/scripts/deploy-compose.sh deploy

# View container status
./prod-deploy/scripts/deploy-compose.sh status

# Follow logs
./prod-deploy/scripts/deploy-compose.sh logs
```

### Deployment Commands

| Command | Action |
|---------|--------|
| `./prod-deploy/scripts/deploy-compose.sh deploy` | Generate release tag, build & push multi-arch image to GHCR, sync to VM, run `up -d --wait` |
| `./prod-deploy/scripts/deploy-compose.sh deploy-only` | Deploy current image tag from `.env.production` without rebuilding |
| `./prod-deploy/scripts/deploy-compose.sh status` | Show running containers and health status (`docker compose ps`) |
| `./prod-deploy/scripts/deploy-compose.sh logs` | Stream live container logs (`docker compose logs -f --tail=200`) |
| `./prod-deploy/scripts/deploy-compose.sh restart` | Restart all containers on the VM |

---

## Decommissioning from k3s

Once the Atlas VM container is healthy and Cloudflare tunnel routing is verified:

```bash
kubectl delete namespace spatika
```

---

## Private Logs over Tailscale

Open `http://<ATLAS_TAILSCALE_IP>:9997` in your browser while connected to Tailscale.
- Dozzle provides real-time logs for `spatika-web`.
- Dozzle is accessed via an isolated, read-only Docker socket proxy (`docker-socket-proxy`) with container execution and write operations disabled.
