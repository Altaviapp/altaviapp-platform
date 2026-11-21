"use client";
// Mapa con MapLibre GL. Teselas vectoriales abiertas (PMTiles de OpenStreetMap) servidas
// desde el propio servidor; sin PMTiles configurado usa las teselas públicas de OSM (solo desarrollo).
import { layers, namedFlavor } from "@protomaps/basemaps";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { useEffect, useRef, useState } from "react";
import { decodePolyline } from "@/lib/geo";
import type { MapProps, Pin } from "./map";

const PMTILES = process.env.NEXT_PUBLIC_PMTILES_URL;
const ASSETS = process.env.NEXT_PUBLIC_MAP_ASSETS_URL ?? "https://protomaps.github.io/basemaps-assets";
const DEFAULT_CENTER: [number, number] = [-74.0721, 4.711]; // Bogotá (lng, lat)

// El mapa en la paleta de la marca: crema, musgo y agua pizarra, sin colores que compitan
// con el bus y las paradas.
const FLAVOR = {
  ...namedFlavor("light"),
  background: "#ece7d8", earth: "#f3eedf", water: "#c5d6d6",
  park_a: "#e3e8cf", park_b: "#d5deb9", wood_a: "#e1e7cd", wood_b: "#cfdab2", scrub_a: "#e4e8d2", scrub_b: "#d8e0c0",
  hospital: "#f0e6da", industrial: "#ebe6d6", school: "#efe7d2", pedestrian: "#efe9d8", sand: "#efe8d2", beach: "#efe8d2",
  aerodrome: "#e8e4d6", runway: "#f3eedf", zoo: "#e3e8cf", military: "#e8e4d6", glacier: "#f3eedf", pier: "#e3ddca",
  buildings: "#e6dfcb",
  other: "#f8f4e8", minor_service: "#f8f4e8", minor_a: "#fbf8ee", minor_b: "#fffdf6", link: "#fffdf6", major: "#fffdf6", highway: "#fffdf6",
  minor_service_casing: "#e2dac2", minor_casing: "#e2dac2", link_casing: "#dcd3b8", major_casing_early: "#dcd3b8",
  major_casing_late: "#dcd3b8", highway_casing_early: "#d3c9aa", highway_casing_late: "#d3c9aa",
  bridges_other: "#f8f4e8", bridges_minor: "#fffdf6", bridges_link: "#fffdf6", bridges_major: "#fffdf6", bridges_highway: "#fffdf6",
  bridges_other_casing: "#e2dac2", bridges_minor_casing: "#e2dac2", bridges_link_casing: "#dcd3b8", bridges_major_casing: "#dcd3b8", bridges_highway_casing: "#d3c9aa",
  railway: "#c9c2ab", boundaries: "#b9b29a",
  roads_label_minor: "#7b8577", roads_label_minor_halo: "#fffdf6", roads_label_major: "#5d6b5c", roads_label_major_halo: "#fffdf6",
  ocean_label: "#5d7f86", subplace_label: "#7b8577", subplace_label_halo: "#f3eedf", city_label: "#12301f", city_label_halo: "#f3eedf",
  state_label: "#9aa392", state_label_halo: "#f3eedf", country_label: "#7b8577", address_label: "#9aa392", address_label_halo: "#f3eedf",
};

// El proceso auxiliar del mapa se sirve desde public/ (lo copia scripts/copy-assets.mjs).
maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

let protocolAdded = false;

function mapStyle(): maplibregl.StyleSpecification {
  if (PMTILES) {
    if (!protocolAdded) {
      maplibregl.addProtocol("pmtiles", new Protocol().tile);
      protocolAdded = true;
    }
    const url = PMTILES.startsWith("http") ? PMTILES : `${window.location.origin}${PMTILES}`;
    return {
      version: 8,
      glyphs: `${ASSETS}/fonts/{fontstack}/{range}.pbf`,
      sprite: `${ASSETS}/sprites/v4/light`,
      sources: { protomaps: { type: "vector", url: `pmtiles://${url}`, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' } },
      // Sin puntos de interés (tiendas, bancos): solo calles, barrios y parques.
      layers: (layers("protomaps", FLAVOR, { lang: "es" }) as maplibregl.LayerSpecification[]).filter((layer) => !layer.id.startsWith("pois")),
    };
  }
  return {
    version: 8,
    sources: {
      osm: {
        type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, maxzoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
    layers: [
      { id: "fondo", type: "background", paint: { "background-color": "#ece7d8" } },
      { id: "osm", type: "raster", source: "osm", paint: { "raster-saturation": -0.85, "raster-contrast": -0.08, "raster-brightness-min": 0.06 } },
    ],
  };
}

const svg = (d: string) =>
  `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const HOUSE = '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>';
const GLYPH: Partial<Record<Pin["kind"], string>> = {
  school: svg('<path d="M3 10l9-5 9 5-9 5-9-5z"/><path d="M7 12.5V17c2.5 2 7.5 2 10 0v-4.5"/>'),
  bus: svg('<rect x="4" y="4" width="16" height="13" rx="3"/><path d="M4 11h16M8 17v2.5M16 17v2.5"/>'),
  home: svg(HOUSE),
  mine: svg(HOUSE),
};

function pinElement(pin: Pin): HTMLElement {
  const el = document.createElement("div");
  el.className = `pin pin-${pin.kind}`;
  // La etiqueta es solo el número de parada; los iconos son fijos. Nunca texto del usuario como HTML.
  if (pin.label) el.textContent = pin.label;
  else el.innerHTML = GLYPH[pin.kind] ?? "";
  if (pin.title) el.title = pin.title;
  return el;
}

export default function MapInner({ pins, line, path, fitKey, onPick, className }: MapProps) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markers = useRef(new globalThis.Map<string, { marker: maplibregl.Marker; signature: string }>());
  const pick = useRef(onPick);
  pick.current = onPick;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const first = pins[0];
    const map = new maplibregl.Map({
      container: container.current!,
      style: mapStyle(),
      center: first ? [first.lng, first.lat] : DEFAULT_CENTER,
      zoom: 12,
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
    map.on("load", () => {
      map.addSource("recorrido", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } } });
      map.addLayer({
        id: "recorrido", type: "line", source: "recorrido",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#12301f", "line-width": 4, "line-opacity": 0.55 },
      });
      setReady(true);
    });
    map.on("click", (e) => pick.current?.({ lat: e.lngLat.lat, lng: e.lngLat.lng }));
    // El contenedor puede cambiar de tamaño después de montar (diálogos, columnas fijas).
    const observer = new ResizeObserver(() => map.resize());
    observer.observe(container.current!);
    mapRef.current = map;
    const current = markers.current;
    return () => {
      observer.disconnect();
      current.clear();
      map.remove();
      mapRef.current = null;
    };
    // El mapa se crea una sola vez; lo demás se sincroniza en los efectos de abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Marcadores: se mueven los que ya existen (el bus) y se crean o quitan los que cambian.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const seen = new Set<string>();
    for (const pin of pins) {
      seen.add(pin.id);
      const signature = `${pin.kind}|${pin.label ?? ""}|${pin.title ?? ""}`;
      const existing = markers.current.get(pin.id);
      if (existing && existing.signature === signature) {
        existing.marker.setLngLat([pin.lng, pin.lat]);
        continue;
      }
      existing?.marker.remove();
      const marker = new maplibregl.Marker({ element: pinElement(pin) }).setLngLat([pin.lng, pin.lat]).addTo(map);
      marker.getElement().style.zIndex = pin.kind === "bus" ? "3" : pin.kind === "mine" || pin.kind === "school" ? "2" : "1";
      markers.current.set(pin.id, { marker, signature });
    }
    for (const [id, { marker }] of markers.current) {
      if (!seen.has(id)) {
        marker.remove();
        markers.current.delete(id);
      }
    }
  }, [pins]);

  // Recorrido: trazo por calles si existe; si no, línea punteada entre paradas.
  const pathKey = path ?? JSON.stringify(line ?? []);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const points = path ? decodePolyline(path) : (line ?? []);
    (map.getSource("recorrido") as maplibregl.GeoJSONSource).setData({
      type: "Feature", properties: {},
      geometry: { type: "LineString", coordinates: points.length > 1 ? points.map(([lat, lng]) => [lng, lat]) : [] },
    });
    map.setPaintProperty("recorrido", "line-dasharray", path ? [1, 0] : [0.2, 2.4]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathKey, ready]);

  // Encuadre: solo cuando cambia fitKey, no con cada posición del bus.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !pins.length) return;
    map.resize();
    if (pins.length === 1) map.jumpTo({ center: [pins[0].lng, pins[0].lat], zoom: 15 });
    else {
      const bounds = new maplibregl.LngLatBounds();
      pins.forEach((p) => bounds.extend([p.lng, p.lat]));
      map.fitBounds(bounds, { padding: 48, maxZoom: 16, duration: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);

  return <div ref={container} className={className ?? "h-full w-full"} style={onPick ? { cursor: "crosshair" } : undefined} />;
}
