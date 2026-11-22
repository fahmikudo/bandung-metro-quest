# Deployment — ManawiBandung

GitHub Actions menjalankan `typecheck`, `test`, dan `build`, membangun image
nginx statis (beserta reverse proxy `/api/bmkg` untuk cuaca BMKG), mendorongnya
ke GHCR, lalu server cukup **menarik image dan menjalankan `docker compose up -d`**.
Server tidak pernah mengompilasi apa pun.

## File

| Path | Kegunaan |
| --- | --- |
| `.github/workflows/ci.yml` | Typecheck/test/build → build & push GHCR → deploy lewat SSH (hanya tag `v*`) |
| `deploy/docker-compose.yml` | Stack yang dijalankan server (service `web`), disalin ke `/opt/manawi-bandung/` setiap rilis |
| `deploy/deploy.sh` | Disalin ke `/opt/manawi-bandung/deploy.sh` setiap rilis; pull, tulis tag, `up -d --wait` |
| `deploy/.env.example` | Contoh `/opt/manawi-bandung/.env` produksi |
| `deploy/nginx/manawi-bandung.conf` | File site nginx host |
| `Dockerfile` | Multi-stage build Vite (`npm ci` → `npm run build`) lalu sajikan `dist/` lewat nginx |
| `nginx.conf` | Server block di dalam image: SPA fallback, cache policy, gzip, dan proxy `/api/bmkg` |
| `.dockerignore` | Memperkecil build context Docker |

## Image dan tag

```
ghcr.io/fahmikudo/bandung-metro-quest
```

Setiap build di `main` dan setiap rilis mendorong tag:

- `sha-<pendek>`: selalu. Ini yang dipakai untuk rollback.
- `edge`: ujung `main`.
- `X.Y.Z`, `X.Y`, `latest`: hanya dari tag rilis `vX.Y.Z`.

Merge ke `main` hanya mempublikasikan image. **Hanya tag `v*` yang men-deploy.**
Versi yang berjalan tertulis di `/opt/manawi-bandung/.env` pada baris
`MANAWI_WEB_IMAGE_TAG`.

## Proxy Cuaca BMKG (Tanpa Backend)

API publik BMKG (`api.bmkg.go.id`) tidak menyertakan header CORS untuk browser.
Di produksi, `nginx.conf` di dalam container sudah mem-proxy `GET /api/bmkg?adm4=...`
langsung ke `https://api.bmkg.go.id/publik/prakiraan-cuaca`, sehingga cuaca BMKG
langsung berjalan mulus tanpa perlu backend Node/Express tambahan.

## Setup server, sekali saja

```bash
sudo install -d -o deploy -g deploy -m 750 /opt/manawi-bandung
```

Salin file pertama kali dari laptop (setelah itu CI yang memperbarui compose dan
`deploy.sh`):

```bash
scp deploy/docker-compose.yml deploy/deploy.sh deploy@<server>:/opt/manawi-bandung/
scp deploy/.env.example deploy@<server>:/opt/manawi-bandung/.env
ssh deploy@<server> 'chmod +x /opt/manawi-bandung/deploy.sh && chmod 600 /opt/manawi-bandung/.env'
```

Isi `/opt/manawi-bandung/.env`:

- `MANAWI_WEB_IMAGE_TAG` dibiarkan kosong: `deploy.sh` yang mengisinya saat rilis pertama.
- `APP_PORT` (bawaan `8700`) harus sama dengan `upstream` di site nginx dan belum
  dipakai di server (`ss -ltn | grep :8700`).

`VITE_GA_MEASUREMENT_ID` dan `VITE_WHATSAPP_NUMBER` tidak ada di file ini: nilainya
berasal dari repository variable GitHub dan ditanam saat build.

## Login GHCR

*(Lewati jika user `deploy` di server sudah login GHCR sebelumnya.)*

```bash
sudo -u deploy bash -c 'echo "$GHCR_READ_TOKEN" | docker login ghcr.io -u fahmikudo --password-stdin'
```

## Nginx Host

Cloudflare menangani TLS (mode Flexible); origin hanya HTTP port 80.
Domain di `deploy/nginx/manawi-bandung.conf` sudah diset ke `manawi.web.id`
(`www.manawi.web.id` dialihkan ke domain kanonik):

```bash
sudo cp deploy/nginx/manawi-bandung.conf /etc/nginx/sites-available/manawi-bandung.conf
sudo ln -s /etc/nginx/sites-available/manawi-bandung.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Secret dan variable GitHub

Environment **production** di repo `bandung-metro-quest`:

| Secret | Isi |
| --- | --- |
| `DEPLOY_HOST` | alamat server |
| `DEPLOY_PORT` | port SSH |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_SSH_KEY` | private key deploy |
| `DEPLOY_KNOWN_HOSTS` | hasil `ssh-keyscan -p <port> <host>` |

Repository variable (Settings → Variables → Actions):

| Variable | Wajib | Isi |
| --- | --- | --- |
| `VITE_GA_MEASUREMENT_ID` | opsional | Measurement ID GA4, misal `G-XXXXXXXXXX` |
| `VITE_WHATSAPP_NUMBER` | opsional | Nomor WA tanpa `+` (default `6285155377009`) |
| `WEB_URL` | opsional | Origin frontend untuk smoke test, misal `https://manawi.web.id` |

## Rilis

```bash
git tag v1.0.0
git push origin v1.0.0
```

Workflow menjalankan test dan build, membangun image, lalu lewat SSH:

1. menyalin `docker-compose.yml` dan `deploy.sh` ke `/opt/manawi-bandung/`;
2. menjalankan `/opt/manawi-bandung/deploy.sh MANAWI_WEB_IMAGE_TAG 1.0.0 web`:
   pull → tulis tag ke `.env` → `docker compose up -d --wait` → prune;
3. smoke test `GET ${WEB_URL}/` dan `GET ${WEB_URL}/api/bmkg?adm4=32.73.19.1001` bila `WEB_URL` diisi.

## Rollback

```bash
ssh deploy@<server>
cd /opt/manawi-bandung
sed -i 's|^MANAWI_WEB_IMAGE_TAG=.*|MANAWI_WEB_IMAGE_TAG=sha-xxxxxxx|' .env
docker compose up -d
```

## Mengecek deployment

```bash
ssh deploy@<server> 'cd /opt/manawi-bandung && docker compose ps'
curl -sI https://manawi.web.id/                                # 200
curl -sI 'https://manawi.web.id/api/bmkg?adm4=32.73.19.1001'   # 200
```

- `web` berstatus `healthy`.
- Log: `docker compose logs -f web`.
