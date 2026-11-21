// Motor de rutas abierto (OSRM autoalojado). Da el trazo por calles, los tiempos entre
// paradas y el orden óptimo. Si OSRM_URL no está configurado o no responde, quien llama
// usa el cálculo por línea recta de lib/geo.ts.
//
// Tráfico en vivo: OSRM no lo conoce. La hora estimada lo absorbe aprendiendo del historial
// de cada tramo (server/trips.ts). Un proveedor de tráfico de pago se enchufaría aquí,
// ajustando `legMinutes`, sin tocar el resto.
import { toMinutes, toTime } from "@/lib/dates";
import type { Point } from "@/lib/geo";

type Direction = "to_school" | "from_school";
export type Plan = { order: number[]; times: string[]; path: string };

const DWELL_MIN = 1; // tiempo detenido por parada

export const routingEnabled = () => !!process.env.OSRM_URL;

async function osrm(service: "trip" | "route", points: Point[], params: string) {
  const coords = points.map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(";");
  const res = await fetch(`${process.env.OSRM_URL}/${service}/v1/driving/${coords}?${params}`, {
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`OSRM respondió ${res.status}`);
  const body = (await res.json()) as {
    code: string;
    routes?: { geometry: string; legs: { duration: number }[] }[];
    trips?: { geometry: string; legs: { duration: number }[] }[];
    waypoints?: { waypoint_index: number }[];
  };
  if (body.code !== "Ok") throw new Error(`OSRM: ${body.code}`);
  return body;
}

/**
 * Planea una ruta. Con `reorder`, OSRM elige el orden de las paradas dejando fijo el colegio
 * como destino (hacia el colegio) o como origen (desde el colegio).
 * Devuelve null si no hay motor de rutas disponible.
 */
export async function planRoute(
  stops: Point[],
  school: Point,
  direction: Direction,
  startTime: string,
  reorder: boolean,
): Promise<Plan | null> {
  if (!routingEnabled() || !stops.length) return null;
  const toSchool = direction === "to_school";
  const points = toSchool ? [...stops, school] : [school, ...stops];
  const common = "overview=full&geometries=polyline";
  try {
    let order = stops.map((_, i) => i);
    let legs: number[];
    let path: string;
    if (reorder && stops.length > 1) {
      const ends = toSchool ? "source=any&destination=last" : "source=first&destination=any";
      const body = await osrm("trip", points, `${common}&roundtrip=false&${ends}`);
      // waypoint_index es la posición de cada punto de entrada dentro del recorrido.
      const position = body.waypoints!.map((w) => w.waypoint_index);
      const stopOffset = toSchool ? 0 : 1;
      order = stops.map((_, i) => i).sort((a, b) => position[a + stopOffset] - position[b + stopOffset]);
      legs = body.trips![0].legs.map((l) => l.duration / 60);
      path = body.trips![0].geometry;
    } else {
      const body = await osrm("route", points, common);
      legs = body.routes![0].legs.map((l) => l.duration / 60);
      path = body.routes![0].geometry;
    }
    // Hacia el colegio la hora de inicio es la de la primera parada; desde el colegio, la salida.
    let minutes = toMinutes(startTime);
    const times = order.map((_, i) => {
      if (toSchool) {
        if (i > 0) minutes += legs[i - 1] + DWELL_MIN;
      } else minutes += legs[i] + DWELL_MIN;
      return toTime(minutes);
    });
    return { order, times, path };
  } catch (error) {
    console.error("Motor de rutas no disponible:", (error as Error).message);
    return null;
  }
}
