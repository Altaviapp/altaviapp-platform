#!/bin/sh
# Prepara los datos abiertos de mapas de Colombia (OpenStreetMap) en ./data. Requiere Docker.
#   ./scripts/maps.sh teselas   mapa base (PMTiles) y sus fuentes        ~ cientos de MB
#   ./scripts/maps.sh rutas     datos del motor de rutas OSRM            ~ 4 GB de RAM al preparar
# Para otra zona, cambiar BBOX (oeste,sur,este,norte) y REGION (ruta en download.geofabrik.de).
set -eu
BBOX=${BBOX:--79.1,-4.3,-66.8,13.5}
REGION=${REGION:-south-america/colombia}
MAXZOOM=${MAXZOOM:-15}
NAME=$(basename "$REGION")

case "${1:-}" in
teselas)
  mkdir -p data/tiles
  BUILD=${BUILD:-$(wget -qO- https://build-metadata.protomaps.dev/builds.json | tr '{' '\n' | grep -o '"key":"[0-9]*\.pmtiles"' | tail -1 | cut -d'"' -f4)}
  echo "Extrayendo $BBOX del mapa mundial $BUILD…"
  docker run --rm -v "$PWD/data/tiles:/data" protomaps/go-pmtiles extract \
    "https://build.protomaps.com/$BUILD" /data/colombia.pmtiles --bbox="$BBOX" --maxzoom="$MAXZOOM"
  if [ ! -d data/tiles/assets ]; then
    echo "Descargando fuentes e iconos del mapa…"
    git clone --depth 1 https://github.com/protomaps/basemaps-assets data/tiles/assets
    rm -rf data/tiles/assets/.git
  fi
  echo "Listo: data/tiles/colombia.pmtiles"
  ;;
rutas)
  mkdir -p data/osrm
  IMAGE=ghcr.io/project-osrm/osrm-backend:latest
  [ -f "data/osrm/$NAME-latest.osm.pbf" ] || wget -O "data/osrm/$NAME-latest.osm.pbf" "https://download.geofabrik.de/$REGION-latest.osm.pbf"
  run() { docker run --rm -v "$PWD/data/osrm:/data" "$IMAGE" "$@"; }
  run osrm-extract -p /opt/car.lua "/data/$NAME-latest.osm.pbf"
  run osrm-partition "/data/$NAME-latest.osrm"
  run osrm-customize "/data/$NAME-latest.osrm"
  echo "Listo. Pon OSRM_URL=http://osrm:5000 en .env y levanta con: docker compose --profile rutas up -d"
  ;;
*)
  echo "Uso: $0 teselas | rutas" >&2
  exit 1
  ;;
esac
