"use client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import type { MapProps, Pin } from "./map";

const TILES = process.env.NEXT_PUBLIC_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_CENTER: [number, number] = [-0.1807, -78.4678]; // Quito

const svg = (d: string) =>
  `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const GLYPH: Partial<Record<Pin["kind"], string>> = {
  school: svg('<path d="M3 10l9-5 9 5-9 5-9-5z"/><path d="M7 12.5V17c2.5 2 7.5 2 10 0v-4.5"/>'),
  bus: svg('<rect x="4" y="4" width="16" height="13" rx="3"/><path d="M4 11h16M8 17v2.5M16 17v2.5"/>'),
  home: svg('<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>'),
  mine: svg('<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>'),
};

function icon(pin: Pin) {
  const text = pin.label ?? GLYPH[pin.kind] ?? "";
  return L.divIcon({
    className: "",
    html: `<div class="pin pin-${pin.kind}">${text}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function Fit({ pins, fitKey }: { pins: Pin[]; fitKey?: string }) {
  const map = useMap();
  // El contenedor puede cambiar de tamaño después de montar (diálogos, columnas fijas).
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  useEffect(() => {
    if (!pins.length) return;
    map.invalidateSize();
    if (pins.length === 1) map.setView([pins[0].lat, pins[0].lng], 15);
    else map.fitBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng])), { padding: [44, 44], maxZoom: 16 });
    // Solo se reencuadra cuando cambia fitKey, no con cada posición del bus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, fitKey]);
  return null;
}

function Picker({ onPick }: { onPick: NonNullable<MapProps["onPick"]> }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

export default function MapInner({ pins, line, fitKey, onPick, className }: MapProps) {
  const first = pins[0];
  return (
    <MapContainer
      center={first ? [first.lat, first.lng] : DEFAULT_CENTER}
      zoom={13}
      scrollWheelZoom
      className={className ?? "h-full w-full"}
      style={onPick ? { cursor: "crosshair" } : undefined}
    >
      <TileLayer url={TILES} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
      {line && line.length > 1 && <Polyline positions={line} pathOptions={{ color: "#12301f", weight: 3, opacity: 0.5, dashArray: "2 9", lineCap: "round" }} />}
      {pins.map((pin) => (
        <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={icon(pin)} zIndexOffset={pin.kind === "bus" ? 1000 : 0}>
          {pin.title && <Tooltip direction="top" offset={[0, -14]}>{pin.title}</Tooltip>}
        </Marker>
      ))}
      <Fit pins={pins} fitKey={fitKey} />
      {onPick && <Picker onPick={onPick} />}
    </MapContainer>
  );
}
