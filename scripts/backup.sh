#!/bin/sh
# Respaldo cifrado de la base de datos (pg_dump + gzip + AES-256). Corre en el servidor,
# desde la carpeta del proyecto. Programarlo a diario con cron:
#   15 3 * * *  cd /ruta/a/abordo && ./scripts/backup.sh >> data/backups/respaldo.log 2>&1
# y copiar data/backups fuera del servidor (rclone, restic o el almacenamiento del proveedor).
#
#   ./scripts/backup.sh                      crea un respaldo
#   ./scripts/backup.sh restaurar ARCHIVO    restaura (reemplaza los datos actuales)
set -eu
. ./.env
: "${BACKUP_PASSPHRASE:?define BACKUP_PASSPHRASE en .env}"
export BACKUP_PASSPHRASE
DIR=data/backups
KEEP_DAYS=${BACKUP_KEEP_DAYS:-14}
mkdir -p "$DIR"

if [ "${1:-}" = "restaurar" ]; then
  file=${2:?indica el archivo a restaurar}
  echo "Restaurando $file sobre la base actual…"
  docker compose stop app
  openssl enc -d -aes-256-cbc -pbkdf2 -pass env:BACKUP_PASSPHRASE -in "$file" | gunzip \
    | docker compose exec -T db psql -q -v ON_ERROR_STOP=1 -U postgres -d abordo
  docker compose start app
  echo "Restauración terminada."
  exit 0
fi

file="$DIR/abordo-$(date -u +%Y%m%d-%H%M%S).sql.gz.enc"
docker compose exec -T db pg_dump -U postgres -d abordo --clean --if-exists \
  | gzip -9 \
  | openssl enc -aes-256-cbc -pbkdf2 -salt -pass env:BACKUP_PASSPHRASE -out "$file.tmp"
mv "$file.tmp" "$file"
find "$DIR" -name 'abordo-*.sql.gz.enc' -mtime +"$KEEP_DAYS" -delete
echo "Respaldo listo: $file ($(du -h "$file" | cut -f1))"
