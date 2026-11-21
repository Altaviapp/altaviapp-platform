"use client";
// Mapa. MapLibre toca `window`, así que se carga solo en el navegador.
import dynamic from "next/dynamic";

export type Pin = {
  id: string;
  lat: number;
  lng: number;
  kind: "school" | "stop" | "done" | "mine" | "home" | "bus";
  label?: string;
  title?: string;
};

export type MapProps = {
  pins: Pin[];
  /** Línea punteada entre puntos [lat, lng], cuando no hay trazo por calles. */
  line?: [number, number][];
  /** Trazo por calles (polilínea codificada del motor de rutas). Tiene prioridad sobre `line`. */
  path?: string;
  /** Al cambiar, el mapa vuelve a encuadrar los puntos. Las posiciones en vivo no lo mueven. */
  fitKey?: string;
  onPick?: (point: { lat: number; lng: number }) => void;
  className?: string;
};

export const Map = dynamic(() => import("./map-inner"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-line/60" />,
});
