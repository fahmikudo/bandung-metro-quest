#!/usr/bin/env bash
#
# Roll forward stack ManawiBandung ke tag image baru.
#
#   deploy.sh MANAWI_WEB_IMAGE_TAG 1.0.0 web
#
# Tag ditulis ke /opt/manawi-bandung/.env (bukan hanya env sementara di `up`),
# sehingga file .env selalu mencatat versi yang sedang berjalan dan rollback
# cukup 1 edit + `docker compose up -d`. CI menyalin skrip ini ke
# /opt/manawi-bandung/deploy.sh lalu menjalankannya via SSH di setiap tag rilis.
# Lihat DEPLOYMENT.md.

set -euo pipefail

readonly STACK_DIR="${STACK_DIR:-/opt/manawi-bandung}"

if [ "$#" -lt 3 ]; then
  echo "usage: $0 <ENV_VAR> <TAG> <service> [service...]" >&2
  exit 64
fi

var="$1"
tag="$2"
shift 2
services=("$@")

cd "${STACK_DIR}"

if [ ! -f .env ]; then
  echo "${STACK_DIR}/.env is missing; the stack has never been provisioned" >&2
  exit 1
fi

# Pull dulu dengan tag khusus perintah ini: bila tag belum ada di GHCR,
# proses berhenti aman sebelum .env diubah.
echo "==> pulling ${var}=${tag}"
env "${var}=${tag}" docker compose pull "${services[@]}"

# Ganti baris jika sudah ada, atau tambahkan bila belum ada.
# Menggunakan file sementara + `cat >` agar kompatibel GNU/BSD sed
# serta menjaga owner dan permission chmod 600.
if grep -q "^${var}=" .env; then
  tmp="$(mktemp)"
  sed "s|^${var}=.*|${var}=${tag}|" .env > "${tmp}"
  cat "${tmp}" > .env
  rm -f "${tmp}"
else
  printf '%s=%s\n' "${var}" "${tag}" >> .env
fi

echo "==> ${var}=${tag}"

# --wait menunggu container berstatus healthy; bila gagal, CI langsung merah.
if ! docker compose up -d --wait "${services[@]}"; then
  docker compose logs --tail=100 "${services[@]}" || true
  echo "deploy failed. To roll back: put the previous tag in ${STACK_DIR}/.env (${var}=...)" >&2
  echo "and run: cd ${STACK_DIR} && docker compose up -d" >&2
  exit 1
fi

# Hapus dangling layers; rollback tetap bisa pull tag lama dari GHCR.
docker image prune -f

docker compose ps
