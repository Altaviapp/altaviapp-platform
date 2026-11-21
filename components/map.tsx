"use client";
// Mapa. Leaflet toca `window`, así que se carga solo en el navegador.
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
  line?: [number, number][];
  /** Al cambiar, el mapa vuelve a encuadrar los puntos. Las posiciones en vivo no lo mueven. */
  fitKey?: string;
  onPick?: (point: { lat: number; lng: number }) => void;
  className?: string;
};

export const Map = dynamic(() => import("./map-inner"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-line/60" />,
});
