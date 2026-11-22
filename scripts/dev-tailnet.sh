#!/bin/sh
# Levanta la versión de desarrollo y la publica SOLO dentro de tu tailnet de Tailscale,
# con HTTPS (necesario para cámara, ubicación y notificaciones en el celular).
#
#   ./scripts/dev-tailnet.sh           levanta todo y muestra la dirección
#   ./scripts/dev-tailnet.sh codigos   muestra los códigos de acceso que se van pidiendo
#   ./scripts/dev-tailnet.sh registro  sigue el registro de la app
#   ./scripts/dev-tailnet.sh parar     apaga todo y deja de publicar
#
# Requisitos: Docker, y Tailscale conectado en esta máquina con MagicDNS y certificados
# HTTPS activados en el panel de la tailnet (DNS → Enable HTTPS).
# En Windows se corre dentro de WSL, con el proyecto en la carpeta de Linux (no en /mnt/c),
# Tailscale instalado en Windows y Docker Desktop con la integración de WSL activada.
set -eu
cd "$(dirname "$0")/.."
PORT=${DEV_PORT:-3000}
COMPOSE="docker compose -f docker-compose.dev.yml"

# Dónde está Tailscale: en Linux es `tailscale`; en WSL se usa el de Windows (`tailscale.exe`);
# en macOS la app no siempre deja el comando en el PATH.
TS=${TAILSCALE:-}
if [ -z "$TS" ]; then
  MAC=/Applications/Tailscale.app/Contents/MacOS/Tailscale
  if command -v tailscale >/dev/null 2>&1; then TS=tailscale
  elif command -v tailscale.exe >/dev/null 2>&1; then TS=tailscale.exe
  elif [ -x "$MAC" ]; then TS=$MAC
  else
    echo "No encuentro Tailscale. Instálalo y conéctate: https://tailscale.com/download" >&2
    echo "En WSL: instala Tailscale en Windows, ábrelo e inicia sesión." >&2
    exit 1
  fi
fi

case "${1:-}" in
codigos) exec $COMPOSE logs -f --no-log-prefix app | grep --line-buffered "es tu código" ;;
registro) exec $COMPOSE logs -f --no-log-prefix app ;;
parar)
  "$TS" serve --https=443 off >/dev/null 2>&1 || true
  $COMPOSE down
  echo "Versión de desarrollo apagada."
  exit 0
  ;;
esac

# Nombre de esta máquina en la tailnet, p. ej. servidor.tu-tailnet.ts.net
STATUS=$("$TS" status --json 2>/dev/null | tr -d '\r' || true)
if command -v jq >/dev/null 2>&1; then
  NAME=$(printf '%s' "$STATUS" | jq -r '.Self.DNSName // empty')
elif command -v python3 >/dev/null 2>&1; then
  NAME=$(printf '%s' "$STATUS" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("Self",{}).get("DNSName",""))' 2>/dev/null || true)
else
  NAME=$(printf '%s' "$STATUS" | tr -d '\n' | sed -n 's/.*"Self":[^}]*"DNSName":"\([^"]*\)".*/\1/p')
fi
NAME=${NAME%.}
if [ -z "$NAME" ]; then
  echo "Tailscale no está conectado, o MagicDNS está apagado en tu tailnet." >&2
  exit 1
fi
URL="https://$NAME"

# La app necesita saber su dirección pública (correos y verificación de origen).
ENV=.env.development.local
touch "$ENV"
grep -v '^APP_URL=' "$ENV" > "$ENV.tmp" || true
echo "APP_URL=$URL" >> "$ENV.tmp"
mv "$ENV.tmp" "$ENV"

$COMPOSE up -d
"$TS" serve --bg --https=443 "http://127.0.0.1:$PORT" >/dev/null

echo
echo "Abordo (desarrollo) quedará en:  $URL"
echo "La primera vez tarda unos minutos mientras instala dependencias. Para verlo:  $0 registro"
echo
echo "Usuarios de demostración:"
echo "  coordinacion@demo.abordo.app   ramiro@demo.abordo.app (conductor)   lucia@demo.abordo.app (familia)"
echo "El código de acceso no llega por correo en desarrollo. Míralo con:  $0 codigos"
