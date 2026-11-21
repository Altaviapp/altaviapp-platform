// Geometría simple: distancia, orden de paradas y horas estimadas.
import { toMinutes, toTime } from "./dates";

export type Point = { lat: number; lng: number };

/** Distancia en metros entre dos puntos (haversine). */
export function distance(a: Point, b: Point): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Ordena paradas por vecino más cercano.
 * Hacia el colegio: empieza en la más lejana y termina cerca del colegio.
 * Desde el colegio: empieza en la más cercana al colegio.
 */
export function orderStops<T extends Point>(
  stops: T[],
  school: Point,
  direction: "to_school" | "from_school",
): T[] {
  if (stops.length < 2) return [...stops];
  const pending = [...stops];
  const ordered: T[] = [];
  let current: Point = school;
  if (direction === "to_school") {
    // El recorrido inverso (colegio → afuera) invertido da un recorrido que converge al colegio.
    while (pending.length) {
      const i = nearestIndex(pending, current);
      current = pending[i];
      ordered.unshift(pending.splice(i, 1)[0]);
    }
    return ordered;
  }
  while (pending.length) {
    const i = nearestIndex(pending, current);
    current = pending[i];
    ordered.push(pending.splice(i, 1)[0]);
  }
  return ordered;
}

function nearestIndex(points: Point[], from: Point): number {
  let best = 0;
  for (let i = 1; i < points.length; i++) {
    if (distance(points[i], from) < distance(points[best], from)) best = i;
  }
  return best;
}

const SPEED_M_PER_MIN = (20 * 1000) / 60; // 20 km/h promedio urbano
const DETOUR = 1.4; // la calle es más larga que la línea recta
const DWELL_MIN = 1; // tiempo detenido por parada

/** Minutos estimados entre dos puntos, por calle. */
export function travelMinutes(a: Point, b: Point): number {
  return (distance(a, b) * DETOUR) / SPEED_M_PER_MIN;
}

/**
 * Hora prevista de cada parada a partir de la hora de inicio.
 * Hacia el colegio la hora de inicio es la de la primera parada;
 * desde el colegio es la salida del colegio.
 */
export function estimateTimes<T extends Point>(
  stops: T[],
  startTime: string,
  school: Point | undefined,
  direction: "to_school" | "from_school",
): string[] {
  let minutes = toMinutes(startTime);
  let previous: Point | undefined = direction === "from_school" ? school : undefined;
  return stops.map((s) => {
    if (previous) minutes += travelMinutes(previous, s) + DWELL_MIN;
    previous = s;
    return toTime(minutes);
  });
}
